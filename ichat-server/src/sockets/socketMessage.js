const CallHistory = require("../schemas/CallHistory");

// Map để lưu trữ userId -> socketId
const userSocketMap = new Map();

// Định nghĩa trạng thái cuộc gọi
const CallStatus = {
  PENDING: "pending", // Đang chờ người nhận trả lời
  ACCEPTED: "accepted", // Người nhận đã chấp nhận
  ACTIVE: "active", // Cuộc gọi đang diễn ra
  ENDED: "ended", // Cuộc gọi đã kết thúc
  REJECTED: "rejected", // Người nhận từ chối
  CANCELLED: "cancelled", // Người gọi hủy cuộc gọi
};

// Map để lưu trữ các cuộc gọi đang diễn ra
const activeAudioCalls = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Đặt ở đầu file socket.on("connection")
    socket.on("user-connected", (userId) => {
      console.log(`[Server] User ${userId} connected with socket ${socket.id}`);
      userSocketMap.set(userId, socket.id);

      // Debug: In ra map sau khi cập nhật
      console.log("[Server] Updated user socket map:");
      userSocketMap.forEach((socketId, userId) => {
        console.log(`userId: ${userId} -> socketId: ${socketId}`);
      });
    });

    // Tham gia room theo chatId
    socket.on("join-room", (chatId) => {
      socket.join(chatId);
      // console.log(` Socket ${socket.id} joined room: ${chatId}`);
    });

    // Gửi tin nhắn
    socket.on("send-message", async (messageData) => {
      try {
        console.log("Gửi tin nhắn:", messageData);
        // Phát tin nhắn đến tất cả client trong phòng chat
        io.to(messageData.chatId).emit("receive-message", messageData);
        console.log("Tin nhắn phát đến room:", messageData.chatId);
      } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        socket.emit("send-message-error", "Lỗi gửi tin nhắn");
      }
    });

    //Xoá toàn bộ tin nhắn
    socket.on("delete-all-messages", ({ chatId, userId }) => {
      io.to(chatId).emit("deleted-all-messages", { chatId, userId });
      console.log(` Deleted all messages in room: ${chatId}`);
    });

    // Thu hồi tin nhắn
    socket.on("recall-message", (data) => {
      console.log(" recall-message data:", data); // check chatId
      const { chatId, messageId, senderId, newContent } = data;

      io.to(chatId).emit("message-recalled", {
        chatId,
        messageId,
        senderId,
        newContent,
      });

      console.log(`Message ${messageId} recalled in room: ${chatId}`);
    });

    // Thêm reaction
    socket.on("add-reaction", ({ chatId, messageId, userId, reaction }) => {
      io.to(chatId).emit("reaction-added", {
        chatId,
        messageId,
        userId,
        reaction,
      });
      console.log(` Reaction added to message ${messageId} in room: ${chatId}`);
    });

    // Xoá reaction
    socket.on("remove-reaction", ({ chatId, messageId, userId }) => {
      io.to(chatId).emit("reaction-removed", {
        chatId,
        messageId,
        userId,
      });
      console.log(
        ` Reaction removed from message ${messageId} in room: ${chatId}`
      );
    });

    // Ghim tin nhắn
    socket.on("pin-message", ({ chatId, messageId, isPinned }) => {
      io.to(chatId).emit("message-pinned", {
        chatId,
        messageId,
        isPinned,
      });
      console.log(`Message ${messageId} pin status updated in room: ${chatId}`);
    });

    // Trả lời tin nhắn
    socket.on("reply-message", ({ chatId, message }) => {
      io.to(chatId).emit("message-replied", {
        chatId,
        message,
      });
      console.log(`Replied to message in room: ${chatId}`);
    });

    // Xử lý yêu cầu gọi
    socket.on("audio-call-request", ({ callerId, receiverId, roomId }) => {
      console.log("[Server] New call request:", {
        callerId,
        receiverId,
        roomId,
      });

      // Kiểm tra xem người nhận có đang trong cuộc gọi khác không
      const isReceiverBusy = Array.from(activeAudioCalls.values()).some(
        (call) =>
          (call.receiverId === receiverId || call.callerId === receiverId) &&
          [CallStatus.PENDING, CallStatus.ACCEPTED, CallStatus.ACTIVE].includes(
            call.status
          )
      );

      if (isReceiverBusy) {
        socket.emit("call-failed", {
          error: "Người nhận đang trong cuộc gọi khác",
          code: "RECEIVER_BUSY",
        });
        return;
      }

      // Khởi tạo cuộc gọi mới với cấu trúc đầy đủ
      const newCall = {
        callerId,
        receiverId,
        status: CallStatus.PENDING,
        startTime: new Date(),
        participants: [callerId], // Người gọi là participant đầu tiên
        metadata: {
          roomId,
          callerSocketId: socket.id,
          receiverSocketId: userSocketMap.get(receiverId),
        },
      };

      // Lưu thông tin cuộc gọi
      activeAudioCalls.set(roomId, newCall);

      // Log trạng thái cuộc gọi
      console.log(
        "[Server] Active calls after new request:",
        Array.from(activeAudioCalls.entries())
      );

      // Gửi phản hồi về cho người gọi
      socket.emit("call-initiated", {
        success: true,
        receiverId,
        roomId,
      });

      // Gửi thông báo đến người nhận
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("incoming-audio-call", {
          callerId,
          roomId,
        });
      } else {
        // Nếu người nhận offline
        socket.emit("call-failed", {
          error: "Người nhận không online",
          code: "RECEIVER_OFFLINE",
        });
        activeAudioCalls.delete(roomId);
      }
    });

    // Xử lý chấp nhận cuộc gọi
    socket.on(
      "audio-call-accepted",
      async ({ callerId, receiverId, roomId }) => {
        console.log("[Server] Call accepted:", {
          callerId,
          receiverId,
          roomId,
        });

        const call = activeAudioCalls.get(roomId);
        if (call) {
          call.status = CallStatus.ACCEPTED;
          call.acceptTime = new Date();
          call.participants = [callerId, receiverId];

          // Emit to both participants
          const callerSocketId = userSocketMap.get(callerId);
          const receiverSocketId = userSocketMap.get(receiverId);

          if (callerSocketId && receiverSocketId) {
            // Emit call-connected to both participants
            io.to(callerSocketId).to(receiverSocketId).emit("call-connected", {
              roomId,
              participants: call.participants,
              startTime: call.acceptTime,
              callerId,
              receiverId,
            });

            try {
              const callHistory = new CallHistory({
                caller_id: callerId,
                receiver_id: receiverId,
                type: "voice",
                start_time: call.startTime,
                duration: 0,
                end_time: call.acceptTime,
                status: "answered",
              });

              await callHistory.save();
              call.historyId = callHistory._id;
              console.log("[Server] Call history created:", callHistory._id);
            } catch (error) {
              console.error("[Server] Error creating call history:", error);
            }
          }
        }
      }
    );

    socket.on("audio-call-rejected", ({ receiverId, callerId, roomId }) => {
      console.log("[Server] Call rejected:", { receiverId, callerId, roomId });
      const call = activeAudioCalls.get(roomId);
      if (call) {
        // Kiểm tra xem người từ chối có phải là người nhận không
        if (call.receiverId !== receiverId) {
          console.log("[Server] Invalid reject request - not the receiver");
          return;
        }

        call.status = CallStatus.REJECTED;
        call.endTime = new Date();
        call.rejectReason = "user_rejected";

        // Thông báo cho người gọi
        const callerSocketId = userSocketMap.get(callerId);
        if (callerSocketId) {
          io.to(callerSocketId).emit("call-rejected", {
            receiverId,
            callerId,
            roomId,
            timestamp: call.endTime,
          });
        }

        console.log("[Server] Call rejected successfully:", roomId);
        activeAudioCalls.delete(roomId);
      } else {
        console.log("[Server] Call not found for rejection:", roomId);
      }
    });

    // Xử lý hủy cuộc gọi
    socket.on("cancel-audio-call", ({ roomId, receiverId }) => {
      const call = activeAudioCalls.get(roomId);
      if (call) {
        call.status = CallStatus.CANCELLED;
        call.endTime = new Date();

        // Thông báo cho người nhận
        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("call-cancelled", {
            roomId,
            callerId: call.callerId,
          });
        }

        // Xác nhận với người gọi
        socket.emit("call-cancelled-confirmed", {
          success: true,
          roomId,
        });

        activeAudioCalls.delete(roomId);
      }
    });

    // Xử lý kết thúc cuộc gọi
    socket.on("end-audio-call", async ({ roomId }) => {
      const call = activeAudioCalls.get(roomId);
      if (call && call.historyId) {
        const endTime = new Date();
        const duration = Math.floor((endTime - call.acceptTime) / 1000); // Chuyển đổi thành giây

        try {
          // Cập nhật thông tin cuộc gọi trong database
          await CallHistory.findByIdAndUpdate(call.historyId, {
            duration: duration,
            end_time: endTime,
          });

          console.log("[Server] Call history updated:", {
            historyId: call.historyId,
            duration,
            endTime,
          });
        } catch (error) {
          console.error("[Server] Error updating call history:", error);
        }

        // Xóa cuộc gọi khỏi map
        activeAudioCalls.delete(roomId);
      }

      // Thông báo cho tất cả người tham gia
      io.to(roomId).emit("call-ended", { roomId });
    });

    // Xử lý cuộc gọi nhỡ
    socket.on("call-timeout", async ({ callerId, receiverId, roomId }) => {
      try {
        // Tạo bản ghi cuộc gọi với trạng thái "missed"
        const callHistory = new CallHistory({
          caller_id: callerId,
          receiver_id: receiverId,
          type: "voice",
          start_time: new Date(),
          duration: 0,
          end_time: new Date(),
          status: "missed",
        });

        await callHistory.save();
        console.log("[Server] Missed call history created:", callHistory._id);

        // Xóa cuộc gọi khỏi map
        activeAudioCalls.delete(roomId);
      } catch (error) {
        console.error("[Server] Error creating missed call history:", error);
      }
    });

    // Lắng nghe cuộc gọi đến
    socket.on("incoming-audio-call", ({ callerId, roomId }) => {
      console.log(`Incoming call: from=${callerId} room=${roomId}`);
    });

    // Xử lý disconnect
    socket.on("disconnect", () => {
      // Tìm và xử lý các cuộc gọi liên quan đến socket này
      for (const [roomId, call] of activeAudioCalls.entries()) {
        if (
          call.metadata.callerSocketId === socket.id ||
          call.metadata.receiverSocketId === socket.id
        ) {
          // Thông báo cho participants còn lại
          io.to(roomId).emit("call-ended", {
            roomId,
            reason: "participant_disconnected",
          });
          activeAudioCalls.delete(roomId);
        }
      }

      // Xóa user khỏi userSocketMap
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          console.log(`[Server] User ${userId} disconnected`);
          userSocketMap.delete(userId);
          break;
        }
      }
    });
  });
};
