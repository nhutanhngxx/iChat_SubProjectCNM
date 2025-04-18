import io from "socket.io-client";
import { getHostIP } from "./api";

class SocketService {
  constructor() {
    this.socket = null;
    this.ipAdr = getHostIP();
    this.API_URL = `http://${this.ipAdr}:5001/`;
    this.messageHandlers = new Map();
  }

  connect() {
    if (!this.socket) {
      this.socket = io(this.API_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      this.setupSocketEvents();
    }
    return this.socket;
  }

  disconect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  setupSocketEvents() {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("Socket connected on Socket Service:", this.socket.id);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      this.reconnect();
    });
  }

  joinRoom(roomId) {
    if (this.ensureConnection()) {
      this.socket.emit("join-room", roomId);
    }
  }

  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit("leave-room", roomId);
    }
  }

  handleSendMessage(messageData) {
    if (this.ensureConnection()) {
      this.socket.emit("send-message", messageData);
    }
  }

  onReceiveMessage(callback) {
    if (this.ensureConnection()) {
      this.socket.off("receive-message");
      this.socket.on("receive-message", callback);
    }
  }

  handleRecallMessage(data) {
    if (this.ensureConnection()) {
      this.socket.emit("recall-message", data);
    }
  }

  handleAddReaction({ chatId, messageId, userId, reaction }) {
    console.log(chatId, messageId, userId, reaction);

    if (this.ensureConnection()) {
      this.socket.emit("add-reaction", {
        chatId,
        messageId,
        userId,
        reaction,
      });
    }
  }

  onReactionUpdate(callback) {
    if (this.ensureConnection()) {
      this.socket.off("reaction-added");
      this.socket.off("reaction-removed");

      this.socket.on("reaction-added", callback);
      this.socket.on("reaction-removed", callback);
    }
  }

  sendTypingStatus(chatId, userId, isTyping) {
    if (this.ensureConnection()) {
      this.socket.emit("typing-status", {
        chatId,
        userId,
        isTyping,
      });
    }
  }

  onTypingStatus(callback) {
    if (this.ensureConnection()) {
      this.socket.off("user-typing");
      this.socket.on("user-typing", callback);
    }
  }

  ensureConnection() {
    if (!this.socket?.connected) {
      this.connect();
    }
    return this.socket?.connected;
  }

  reconnect() {
    setTimeout(() => {
      if (this.socket) {
        this.socket.connect();
      }
    }, 3000);
  }

  removeAllListeners() {
    if (this.socket) {
      const events = [
        "receive-message",
        "message-recalled",
        "reaction-added",
        "reaction-removed",
        "user-typing",
      ];

      events.forEach((event) => this.socket.off(event));
    }
  }
}

const socketService = new SocketService();

export default socketService;
