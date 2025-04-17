import io from "socket.io-client";
import { getHostIP } from "./api";

const ipAdr = getHostIP();
const API_iChat = `http://${ipAdr}:5001`;

class SocketService {
  socket = null;

  connect() {
    if (!this.socket) {
      this.socket = io(API_iChat, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on("connect", () => {
        console.log("Socket connected:", this.socket.id);
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          this.connect();
        }, 3000);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(chatId) {
    if (this.socket) {
      this.socket.emit("join-room", chatId);
    }
  }

  leaveRoom(chatId) {
    if (this.socket) {
      this.socket.emit("leave-room", chatId);
    }
  }

  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit("send-message", messageData);
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on("receive-message", callback);
    }
  }

  onMessageStatus(callback) {
    if (this.socket) {
      this.socket.on("message-status", callback);
    }
  }

  markMessageAsSeen(messageId, userId) {
    if (this.socket) {
      this.socket.emit("mark-message-seen", { messageId, userId });
    }
  }

  // Typing indicators
  sendTypingStatus(chatId, userId, isTyping) {
    if (this.socket) {
      this.socket.emit("typing-status", { chatId, userId, isTyping });
    }
  }

  onTypingStatus(callback) {
    if (this.socket) {
      this.socket.on("typing-status", callback);
    }
  }

  // Online status
  updateOnlineStatus(userId, status) {
    if (this.socket) {
      this.socket.emit("user-status", { userId, status });
    }
  }

  onUserStatusChange(callback) {
    if (this.socket) {
      this.socket.on("user-status", callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();
