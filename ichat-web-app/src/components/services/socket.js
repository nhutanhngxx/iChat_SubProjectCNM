// src/services/socket.js
import { io } from "socket.io-client";
const API_URL = `http://${window.location.hostname}:5001/`;

const socket = io(API_URL); // backend websocket

export default socket;
