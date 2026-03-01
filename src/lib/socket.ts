import { io, Socket } from 'socket.io-client';

// Use environment variable specifically for socket if available, otherwise derive or default
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 
                   process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 
                   'http://localhost:5001';

// Create a singleton socket instance
// Only connect on client-side to avoid SSR connection issues
export const socket: Socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket'], // Force WebSocket to avoid xhr poll errors
  autoConnect: typeof window !== 'undefined', // Only auto-connect on client
  reconnectionAttempts: 10,
  reconnectionDelay: 3000,
});
