// src/services/socket.js
import { io } from "socket.io-client";
// const API_URL = `http://${window.location.hostname}:5001/`;
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
const API_URL = `${REACT_APP_API_URL}`;
console.log("API_URL from Socket", API_URL);

const socket = io(API_URL, {
  transports: ["websocket"],
  withCredentials: true,
}); 
export default socket;
