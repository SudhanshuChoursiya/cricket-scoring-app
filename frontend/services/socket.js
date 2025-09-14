// socket.js
import {
  io
} from "socket.io-client";

const socket = io(process.env.EXPO_PUBLIC_BASE_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

export default socket;