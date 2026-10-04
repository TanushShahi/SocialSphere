import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDatabase, db } from './db/index.js';

import { authRouter } from './routes/auth.routes.js';
import { postsRouter } from './routes/posts.routes.js';
import { storiesRouter } from './routes/stories.routes.js';
import { reelsRouter } from './routes/reels.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { messagesRouter } from './routes/messages.routes.js';
import { notificationsRouter } from './routes/notifications.routes.js';
import { uploadRouter } from './routes/upload.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.io with permissive CORS for development and local testing
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads folder
const uploadsDir = process.env.PERSISTENT_DATA_DIR
  ? path.join(path.resolve(process.env.PERSISTENT_DATA_DIR), 'uploads')
  : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'Social Sphere API', time: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/reels', reelsRouter);
app.use('/api/users', usersRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/upload', uploadRouter);

// Online users map: userId -> socketId
const onlineUsers = new Map<string, string>();

io.on('connection', (socket) => {
  let registeredUserId: string | null = null;

  // 1. User registers/authenticates on socket
  socket.on('register-user', (userId: string) => {
    if (!userId) return;
    registeredUserId = userId;
    onlineUsers.set(userId, socket.id);
    socket.join(`user_${userId}`);
    io.emit('online-users', Array.from(onlineUsers.keys()));
    console.log(`[Socket] User online: ${userId} (${socket.id})`);
  });

  // 2. Real-time Message Sending
  socket.on('send-message', (data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    text: string;
    mediaUrl?: string;
  }) => {
    try {
      const { conversationId, senderId, receiverId, text, mediaUrl } = data;
      if (!conversationId || !senderId || !receiverId || !text?.trim()) return;

      const msgId = `msg_${Date.now()}`;
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Persist to database
      db.prepare(`
        INSERT INTO messages (id, conversation_id, sender_id, receiver_id, text, media_url, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(msgId, conversationId, senderId, receiverId, text.trim(), mediaUrl || '', 0, nowTime);

      db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?').run(new Date().toISOString(), conversationId);

      const messagePayload = {
        id: msgId,
        conversationId,
        senderId,
        receiverId,
        text: text.trim(),
        mediaUrl: mediaUrl || '',
        isRead: false,
        createdAt: nowTime
      };

      // Emit to receiver's private room
      io.to(`user_${receiverId}`).emit('receive-message', messagePayload);
      // Acknowledge back to sender
      socket.emit('message-sent', messagePayload);
    } catch (err) {
      console.error('[Socket] send-message error:', err);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // 3. Typing Indicators
  socket.on('typing', (data: { conversationId: string; senderId: string; receiverId: string }) => {
    io.to(`user_${data.receiverId}`).emit('user-typing', {
      conversationId: data.conversationId,
      userId: data.senderId
    });
  });

  socket.on('stop-typing', (data: { conversationId: string; senderId: string; receiverId: string }) => {
    io.to(`user_${data.receiverId}`).emit('user-stop-typing', {
      conversationId: data.conversationId,
      userId: data.senderId
    });
  });

  // 4. WebRTC Audio & Video Calling Signaling
  // Caller initiates call
  socket.on('call-user', (data: {
    toUserId: string;
    fromUserId: string;
    offer: any;
    callType: 'audio' | 'video';
    caller: {
      id: string;
      username: string;
      name: string;
      avatar: string;
    };
  }) => {
    console.log(`[Call] ${data.caller.username} calling ${data.toUserId} (${data.callType})`);
    io.to(`user_${data.toUserId}`).emit('incoming-call', {
      fromUserId: data.fromUserId,
      offer: data.offer,
      callType: data.callType,
      caller: data.caller
    });
  });

  // Recipient accepts call and sends WebRTC answer
  socket.on('call-accepted', (data: { toUserId: string; answer: any }) => {
    console.log(`[Call] Call accepted by recipient, answering to ${data.toUserId}`);
    io.to(`user_${data.toUserId}`).emit('call-accepted', {
      answer: data.answer
    });
  });

  // Exchange ICE candidates
  socket.on('ice-candidate', (data: { toUserId: string; candidate: any }) => {
    io.to(`user_${data.toUserId}`).emit('ice-candidate', {
      candidate: data.candidate
    });
  });

  // Call rejected
  socket.on('reject-call', (data: { toUserId: string }) => {
    console.log(`[Call] Call rejected, notifying ${data.toUserId}`);
    io.to(`user_${data.toUserId}`).emit('call-rejected');
  });

  // End active call
  socket.on('end-call', (data: { toUserId: string }) => {
    console.log(`[Call] Call ended, notifying ${data.toUserId}`);
    io.to(`user_${data.toUserId}`).emit('call-ended');
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    if (registeredUserId) {
      onlineUsers.delete(registeredUserId);
      io.emit('online-users', Array.from(onlineUsers.keys()));
      console.log(`[Socket] User disconnected: ${registeredUserId}`);
    }
  });
});

// Initialize database and start HTTP & WebSocket Server
async function start() {
  try {
    initDatabase();

    httpServer.listen(PORT, () => {
      console.log(`🚀 Social Sphere Backend Server (Express + Socket.io) running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
