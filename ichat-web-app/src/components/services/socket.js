// src/services/socket.js
import { io } from "socket.io-client";
const API_URL = `http://${window.location.hostname}:5001/`;

const socket = io(API_URL); // backend websocket
// export const authenticateSocket = (userId) => {
//   if (userId) {
//     socket.emit("authenticate", userId);
//     console.log("Socket authenticated for user:", userId);
//   }
// };

export default socket;
