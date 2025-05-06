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

  // Dành cho quản lý nhóm
  // Thêm thành viên
  handleAddMember({ groupId, userIds }) {
    if (this.ensureConnection()) {
      this.socket.emit("add-members", { groupId, userIds });
    }
  }
  onMemberAdded(callback) {
    if (this.ensureConnection()) {
      this.socket.on("members-added", callback);
    }
  }

  // Xóa thành viên
  handleRemoveMember({ groupId, userId }) {
    if (this.ensureConnection()) {
      this.socket.emit("remove-member", { groupId, userId });
    }
  }
  onMemberRemoved(callback) {
    if (this.ensureConnection()) {
      this.socket.on("member-removed", callback);
    }
  }

  // Cập nhật thông tin nhóm
  handleUpdateGroup({ groupId, name, avatar }) {
    if (this.ensureConnection()) {
      this.socket.emit("update-group", { groupId, name, avatar });
    }
  }
  onGroupUpdated(callback) {
    if (this.ensureConnection()) {
      this.socket.off("group-updated");
      this.socket.on("group-updated", callback);
    }
  }

  // Rời khỏi nhóm
  handleLeaveGroup({ groupId, userId }) {
    if (this.ensureConnection()) {
      this.socket.emit("leave-group", { groupId, userId });
    }
  }
  onMemberLeft(callback) {
    if (this.ensureConnection()) {
      this.socket.on("member-left", callback);
    }
  }

  // Xóa/giải tán nhóm
  handleDeleteGroup(groupId) {
    if (this.ensureConnection()) {
      this.socket.emit("delete-group", groupId);
    }
  }
  onGroupDeleted(callback) {
    if (this.ensureConnection()) {
      this.socket.on("group-deleted", callback);
    }
  }

  // Chuyển quyền quản trị viên
  handleTransferAdmin({ groupId, userId }) {
    if (this.ensureConnection()) {
      this.socket.emit("transfer-admin", { groupId, userId });
    }
  }
  onAdminTransferred(callback) {
    if (this.ensureConnection()) {
      this.socket.on("admin-transferred", callback);
    }
  }

  // Cập nhật quyền thành viên
  handleSetRole({ groupId, userId, role }) {
    if (this.ensureConnection()) {
      this.socket.emit("set-role", { groupId, userId, role });
    }
  }
  onRoleUpdated(callback) {
    if (this.ensureConnection()) {
      this.socket.on("role-updated", callback);
    }
  }

  // Cập nhật trạng thái phê duyệt thành viên
  handleUpdateMemberApproval({ groupId, requireApproval }) {
    if (this.ensureConnection()) {
      this.socket.emit("update-member-approval", { groupId, requireApproval });
    }
  }
  onMemberApprovalUpdated(callback) {
    if (this.ensureConnection()) {
      this.socket.on("member-approval-updated", callback);
    }
  }

  // Chấp nhận thành viên vào nhóm
  handleAcceptMember({ groupId, memberId }) {
    if (this.ensureConnection()) {
      this.socket.emit("accept-member", { groupId, memberId });
    }
  }
  onMemberAccepted(callback) {
    if (this.ensureConnection()) {
      this.socket.on("member-accepted", callback);
    }
  }

  // Từ chối thành viên vào nhóm
  handleRejectMember({ groupId, memberId }) {
    if (this.ensureConnection()) {
      this.socket.emit("reject-member", { groupId, memberId });
    }
  }
  onMemberRejected(callback) {
    if (this.ensureConnection()) {
      this.socket.on("member-rejected", callback);
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
    return new Promise((resolve, reject) => {
      if (this.ensureConnection()) {
        console.log("[SocketService] Sending accept call request:", {
          callerId,
          receiverId,
          roomId,
        });

        // Listen for call-connected event before emitting accept
        this.socket.once("call-connected", (data) => {
          console.log("[SocketService] Call connected event received:", data);
          resolve(data);
        });

        // Emit accept event
        this.socket.emit("audio-call-accepted", {
          callerId,
          receiverId,
          roomId,
        });

        // Increase timeout to 15 seconds
        setTimeout(() => {
          this.socket.off("call-connected"); // Clean up listener
          reject(new Error("Accept call timeout"));
        }, 15000);
      } else {
        reject(new Error("Socket not connected"));
      }
    });
  }

  // Lắng nghe chấp nhận cuộc gọi
  onCallConnected(callback) {
    console.log("[SocketService] Setting up call connected listener..");
    if (this.socket) {
      this.socket.off("call-connected");
      this.socket.on("call-connected", (data) => {
        console.log("[SocketService] Call connected event received:", data);
        callback(data);
      });
    }
  }

  offCallConnected() {
    if (this.socket) {
      this.socket.off("call-connected");
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

  // Thêm listener mới cho trạng thái kết nối
  onCallConnectionStatus(callback) {
    if (this.socket) {
      this.socket.off("call-connection-status");
      this.socket.on("call-connection-status", (status) => {
        console.log("[SocketService] Call connection status:", status);
        callback(status);
      });
    }
  }

  removeAllListeners() {
    if (this.socket) {
      const events = [
        // Chatting
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
        // Group
        "members-added",
        "member-removed",
        "group-updated",
        "group-deleted",
        "admin-transferred",
        "member-approval-updated",
        "member-accepted",
        "member-rejected",
        "member-left",
      ];

      events.forEach((event) => this.socket.off(event));
    }
  }
}

const socketService = new SocketService();

export default socketService;
