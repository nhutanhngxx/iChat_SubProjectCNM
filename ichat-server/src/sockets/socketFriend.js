module.exports = (io) => {
    io.on("connection", (socket) => {
      console.log(" Client connected:", socket.id);
  
      // Lắng nghe gửi lời mời kết bạn
      socket.on("send-friend-request", ({ sender_id, receiver_id }) => {
        console.log(" Lời mời kết bạn:", sender_id, "->", receiver_id);
        // Gửi sự kiện đến người nhận
        io.to(receiver_id).emit("receive-friend-request", { sender_id });
      });
  
      // Lắng nghe chấp nhận kết bạn
      socket.on("accept-friend-request", ({ sender_id, receiver_id }) => {
        console.log(" Kết bạn thành công:", sender_id, "<->", receiver_id);
        // Gửi thông báo cho cả hai người
        io.to(sender_id).emit("friend-request-accepted", { receiver_id });
        io.to(receiver_id).emit("friend-request-accepted", { sender_id });
      });
  
      // Lắng nghe hủy lời mời kết bạn
      socket.on("cancel-friend-request", ({ sender_id, receiver_id }) => {
        io.to(receiver_id).emit("friend-request-canceled", { sender_id });
      });
  
      //  Lắng nghe block người dùng
      socket.on("block-user", ({ blocker_id, blocked_id }) => {
        io.to(blocked_id).emit("you-have-been-blocked", { by: blocker_id });
      });
  
      //  Hủy kết bạn
      socket.on("unfriend-user", ({ user_id, friend_id }) => {
        io.to(friend_id).emit("you-have-been-unfriended", { by: user_id });
      });
  
      //  Cho user join vào "room cá nhân" theo user_id (để nhận noti riêng)
      socket.on("join-user-room", (userId) => {
        socket.join(userId);
        console.log(`👤 User ${userId} joined personal room`);
      });
    });
  };
  