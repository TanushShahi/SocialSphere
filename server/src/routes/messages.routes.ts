import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

export const messagesRouter = Router();

// 1. Get Conversations
messagesRouter.get('/conversations', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const convRows = db.prepare(`
      SELECT * FROM conversations
      WHERE user1_id = ? OR user2_id = ?
      ORDER BY updated_at DESC
    `).all(userId, userId) as any[];

    const conversations = convRows.map(conv => {
      const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
      const participant = db.prepare('SELECT id, username, name, avatar, bio FROM users WHERE id = ?').get(otherUserId) as any;

      const messages = db.prepare(`
        SELECT id, sender_id, receiver_id, text, media_url, is_read, created_at
        FROM messages
        WHERE conversation_id = ?
        ORDER BY rowid ASC
      `).all(conv.id) as any[];

      const unreadCount = (db.prepare('SELECT COUNT(*) as c FROM messages WHERE conversation_id = ? AND receiver_id = ? AND is_read = 0').get(conv.id, userId) as any).c;

      return {
        id: conv.id,
        participant: {
          id: participant.id,
          username: participant.username,
          name: participant.name,
          avatar: participant.avatar,
          bio: participant.bio
        },
        unreadCount,
        messages: messages.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          text: m.text,
          mediaUrl: m.media_url,
          isRead: Boolean(m.is_read),
          createdAt: m.created_at
        }))
      };
    });

    res.json({ conversations });
  } catch (err) {
    console.error('Conversations error:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// 2. Send Message
messagesRouter.post('/conversations/:id/messages', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const convId = req.params.id;
    const { text, mediaUrl } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Message text is required' });
      return;
    }

    const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(convId) as any;
    if (!conv) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const receiverId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
    const msgId = `msg_${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    db.prepare(`
      INSERT INTO messages (id, conversation_id, sender_id, receiver_id, text, media_url, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(msgId, convId, userId, receiverId, text.trim(), mediaUrl || '', 1, nowTime);

    db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?').run(new Date().toISOString(), convId);

    const newMessage = {
      id: msgId,
      conversationId: convId,
      senderId: userId,
      receiverId,
      text: text.trim(),
      mediaUrl: mediaUrl || '',
      isRead: true,
      createdAt: nowTime
    };

    res.status(201).json({ message: newMessage });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// 3. Get or Create Conversation with another user
messagesRouter.post('/conversations', requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { recipientId } = req.body;

    if (!recipientId || recipientId === userId) {
      res.status(400).json({ error: 'Valid recipientId is required' });
      return;
    }

    const recipient = db.prepare('SELECT id, username, name, avatar, bio FROM users WHERE id = ?').get(recipientId) as any;
    if (!recipient) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let conv = db.prepare(`
      SELECT * FROM conversations 
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `).get(userId, recipientId, recipientId, userId) as any;

    if (!conv) {
      const convId = `conv_${Date.now()}`;
      const now = new Date().toISOString();
      db.prepare('INSERT INTO conversations (id, user1_id, user2_id, updated_at) VALUES (?, ?, ?, ?)').run(
        convId,
        userId,
        recipientId,
        now
      );
      conv = { id: convId, user1_id: userId, user2_id: recipientId, updated_at: now };
    }

    const messages = db.prepare(`
      SELECT id, sender_id, receiver_id, text, media_url, is_read, created_at
      FROM messages
      WHERE conversation_id = ?
      ORDER BY rowid ASC
    `).all(conv.id) as any[];

    res.json({
      conversation: {
        id: conv.id,
        participant: {
          id: recipient.id,
          username: recipient.username,
          name: recipient.name,
          avatar: recipient.avatar,
          bio: recipient.bio
        },
        unreadCount: 0,
        messages: messages.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          text: m.text,
          mediaUrl: m.media_url,
          isRead: Boolean(m.is_read),
          createdAt: m.created_at
        }))
      }
    });
  } catch (err) {
    console.error('Get or create conv error:', err);
    res.status(500).json({ error: 'Failed to initialize conversation' });
  }
});
