import { io, Socket } from 'socket.io-client';

const SERVER_URL = ((import.meta as any).env?.VITE_API_URL as string) || '/';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected with ID:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });
  }
  return socket;
}

export function registerSocketUser(userId: string) {
  const s = getSocket();
  if (s.connected) {
    s.emit('register-user', userId);
  } else {
    s.once('connect', () => {
      s.emit('register-user', userId);
    });
  }
}
