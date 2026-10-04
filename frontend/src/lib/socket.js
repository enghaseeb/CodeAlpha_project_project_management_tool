import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (socket) return socket;
  const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  socket = io(url, { auth: { token }, autoConnect: true });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
