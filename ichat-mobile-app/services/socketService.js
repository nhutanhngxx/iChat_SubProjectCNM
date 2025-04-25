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

  // Dành cho quản lý nhóm
  // Thêm thành viên
  handleAddMember({ groupId, userIds }) {
    if (this.ensureConnection()) {
      this.socket.emit("add-members", { groupId, userIds });
    }
  }

  // Xóa thành viên
  handleRemoveMember({ groupId, userId }) {
    if (this.ensureConnection()) {
      this.socket.emit("remove-member", { groupId, userId });
    }
  }

  // Cập nhật thông tin nhóm
  handleUpdateGroup({ groupId, name, avatar }) {
    console.log("Socket Service -  Handling update group:", {
      groupId,
      name,
      avatar,
    });
    if (this.ensureConnection()) {
      this.socket.emit("update-group", { groupId, name, avatar });
    }
  }
  onGroupUpdated(callback) {
    console.log("SocketService - Setting up group-updated listener");
    if (this.ensureConnection()) {
      this.socket.off("group-updated");
      this.socket.on("group-updated", (data) => {
        console.log("Received group-updated event:", data);
        callback(data);
      });
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

  // Cập nhật trạng thái phê duyệt thành viên
  handleUpdateMemberApproval({ groupId, requireApproval }) {
    if (this.ensureConnection()) {
      this.socket.emit("update-member-approval", { groupId, requireApproval });
    }
  }

  // Chấp nhận thành viên vào nhóm
  handleAcceptMember({ groupId, memberId }) {
    if (this.ensureConnection()) {
      this.socket.emit("accept-member", { groupId, memberId });
    }
  }

  // Từ chối thành viên vào nhóm
  handleRejectMember({ groupId, memberId }) {
    if (this.ensureConnection()) {
      this.socket.emit("reject-member", { groupId, memberId });
    }
  }

  // Lắng nghe sự kiện từ nhóm
  // Thêm thàn viên
  onMemberAdded(callback) {
    if (this.ensureConnection()) {
      this.socket.on("members-added", callback);
    }
  }

  // Xóa thành viên
  onMemberRemoved(callback) {
    if (this.ensureConnection()) {
      this.socket.on("member-removed", callback);
    }
  }

  // Xóa/giải tán nhóm
  onGroupDeleted(callback) {
    if (this.ensureConnection()) {
      this.socket.on("group-deleted", callback);
    }
  }

  // Cập nhật trạng thái phê duyệt thành viên
  onMemberApprovalUpdated(callback) {
    if (this.ensureConnection()) {
      this.socket.on("member-approval-updated", callback);
    }
  }

  // Chấp nhận thành viên vào nhóm
  onMemberAccepted(callback) {
    if (this.ensureConnection()) {
      this.socket.on("member-accepted", callback);
    }
  }

  // Từ chối thành viên vào nhóm
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

  removeAllListeners() {
    if (this.socket) {
      const events = [
        // Chatting
        "receive-message",
        "message-recalled",
        "reaction-added",
        "reaction-removed",
        "user-typing",
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
