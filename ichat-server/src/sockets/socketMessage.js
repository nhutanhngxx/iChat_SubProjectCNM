module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Tham gia room theo chatId
    socket.on("join-room", (chatId) => {
      socket.join(chatId);
      console.log(` Socket ${socket.id} joined room: ${chatId}`);
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
  });
};
