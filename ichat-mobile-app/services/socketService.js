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

  // Thêm phương thức xử lý gửi nhiều ảnh
  handleSendMultipleImages(messageData) {
    if (this.ensureConnection()) {
      // Thêm thông tin về nhóm ảnh vào messageData
      const enhancedMessageData = {
        ...messageData,
        is_group_images: true,
        group_id: messageData.group_id,
        total_images: messageData.total_images,
      };
      this.socket.emit("send-multiple-images", enhancedMessageData);
    }
  }

  // Lắng nghe sự kiện nhận nhiều ảnh
  onReceiveMultipleImages(callback) {
    if (this.ensureConnection()) {
      this.socket.off("receive-multiple-images");
      this.socket.on("receive-multiple-images", (data) => {
        // Đảm bảo thông tin về nhóm ảnh được truyền đến callback
        callback({
          ...data,
          is_group_images: true,
          group_id: data.group_id,
          total_images: data.total_images,
        });
      });
    }
  }

  // Xử lý tiến trình upload ảnh
  handleImageUploadProgress(callback) {
    if (this.ensureConnection()) {
      this.socket.off("image-upload-progress");
      this.socket.on("image-upload-progress", callback);
    }
  }

  // Xử lý lỗi upload ảnh
  handleImageUploadError(callback) {
    if (this.ensureConnection()) {
      this.socket.off("image-upload-error");
      this.socket.on("image-upload-error", callback);
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
        "receive-multiple-images",
        "image-upload-progress",
        "image-upload-error",
      ];

      events.forEach((event) => this.socket.off(event));
    }
  }
}

const socketService = new SocketService();

export default socketService;
