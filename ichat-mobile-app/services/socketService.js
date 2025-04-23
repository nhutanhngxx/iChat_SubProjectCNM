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
      console.log(
        "[Service] Socket connected on Socket Service:",
        this.socket.id
      );
    });

    this.socket.on("connect_error", (error) => {
      console.error("[Service] Connection error:", error);
      this.reconnect();
    });

    this.socket.on("user-registered", (data) => {
      console.log("[SocketService] User registration confirmed:", data);
    });
  }

  // Thêm method để đăng ký user
  registerUser(userId) {
    if (!userId) {
      console.error("[SocketService] Cannot register: userId is undefined");
      return;
    }

    if (!this.socket) {
      this.connect();
    }

    if (this.socket.connected) {
      console.log("[SocketService] Registering user:", userId);
      this.socket.emit("user-connected", userId);
    } else {
      console.log(
        "[SocketService] Socket not connected, waiting for connection..."
      );
      this.socket.once("connect", () => {
        console.log("[SocketService] Connected, now registering user:", userId);
        this.socket.emit("user-connected", userId);
      });
    }
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

  // Audio call methods
  initiateAudioCall({ callerId, receiverId, roomId }) {
    if (this.ensureConnection()) {
      console.log("[AudioCall] Sending call request:", {
        callerId,
        receiverId,
        roomId,
      });

      return new Promise((resolve, reject) => {
        // Lắng nghe phản hồi thành công
        this.socket.once("call-initiated", (response) => {
          console.log("[AudioCall] Call request accepted:", response);
          resolve(response);
        });

        // Lắng nghe phản hồi thất bại
        this.socket.once("call-failed", (error) => {
          console.error("[AudioCall] Call request failed:", error);
          reject(error);
        });

        // Gửi yêu cầu gọi
        this.socket.emit("audio-call-request", {
          callerId,
          receiverId,
          roomId,
        });

        // Timeout sau 5 giây
        setTimeout(() => {
          reject(new Error("Không nhận được phản hồi từ server"));
        }, 5000);
      });
    }
    return Promise.reject(new Error("Socket chưa được kết nối"));
  }

  cancelAudioCall(roomId, receiverId) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error("Socket chưa được kết nối"));
        return;
      }

      console.log("[AudioCall] Canceling call:", { roomId, receiverId });

      // Gửi yêu cầu hủy
      this.socket.emit("cancel-audio-call", { roomId, receiverId });

      // Lắng nghe xác nhận hủy
      this.socket.once("call-cancelled-confirmed", (response) => {
        console.log("[AudioCall] Call cancellation confirmed:", response);
        resolve(response);
      });

      // Timeout sau 3 giây
      setTimeout(() => {
        reject(new Error("Không nhận được xác nhận hủy cuộc gọi"));
      }, 3000);
    });
  }

  onCallCancelled(callback) {
    if (this.socket) {
      this.socket.on("call-cancelled", (data) => {
        console.log("[SocketService] Call cancelled event received:", data);
        callback(data);
      });
    }
  }

  acceptAudioCall(callerId, receiverId, roomId) {
    if (this.ensureConnection()) {
      this.socket.emit("audio-call-accepted", {
        callerId,
        receiverId,
        roomId,
      });
      // Người nhận tham gia phòng
      this.socket.emit("join-audio-call", roomId);
    }
  }

  endAudioCall(roomId) {
    if (this.ensureConnection() && roomId) {
      console.log("[SocketService] Ending call in room:", roomId);
      this.socket.emit("end-audio-call", { roomId });
    }
  }

  // Audio call listeners
  onIncomingAudioCall(callback) {
    if (this.socket) {
      this.socket.on("incoming-audio-call", (data) => {
        console.log("[SocketService] Incoming call:", data);
        callback(data);
      });
    }
  }

  onAudioCallAccepted(callback) {
    if (this.socket) {
      this.socket.on("audio-call-accepted", (data) => {
        console.log("[SocketService] Call accepted:", data);
        callback(data);
      });
    }
  }

  onAudioCallRejected(callback) {
    if (this.socket) {
      this.socket.on("call-rejected", (data) => {
        console.log("[SocketService] Call rejected event received:", data);
        callback(data);
      });
    }
  }

  onAudioCallEnded(callback) {
    if (this.socket) {
      this.socket.on("audio-call-ended", (data) => {
        console.log("[SocketService] Call ended:", data);
        callback(data);
      });
    }
  }

  rejectAudioCall(receiverId, callerId, roomId) {
    if (this.ensureConnection()) {
      console.log("[SocketService] Rejecting call:", {
        receiverId,
        callerId,
        roomId,
      });
      this.socket.emit("audio-call-rejected", {
        receiverId,
        callerId,
        roomId,
      });
    }
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
        "incoming-audio-call",
        "audio-call-accepted",
        "audio-call-rejected",
        "audio-call-ended",
      ];

      events.forEach((event) => this.socket.off(event));
    }
  }
}

const socketService = new SocketService();

export default socketService;
