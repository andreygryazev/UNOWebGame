import { io } from 'socket.io-client';

// In development, Vite proxies /socket.io to localhost:3000
// In production, the server serves the client.
// By using undefined (relative path), it works for both localhost and LAN IPs via the proxy.
const URL = undefined;

export const socket = io(URL, {
  autoConnect: false, // Wait for login to connect
  transports: ['websocket', 'polling']
});

export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};