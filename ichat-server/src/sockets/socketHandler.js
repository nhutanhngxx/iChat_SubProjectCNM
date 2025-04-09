const sessionStore = require("../utils/sessionStore");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Web client connected:", socket.id);

    // Web gửi sessionId để "join" và được lưu socketId
    socket.on("register-session", async (sessionId) => {
      await sessionStore.registerSocket(sessionId, socket.id);
      console.log(`Session ${sessionId} linked to socket ${socket.id}`);
    });

    // Mobile gửi login request sau khi quét QR
    socket.on("qr-login", async ({ sessionId, userInfo }) => {
      console.log("Nhận qr-login từ mobile:", sessionId, userInfo);

      const webSocketId = await sessionStore.getSocketId(sessionId);
      console.log("Tìm socketId trong Redis:", webSocketId); //
      if (webSocketId) {
        // Gửi userInfo về client web
        io.to(webSocketId).emit("qr-login-success", { userInfo });

        // Lưu trạng thái đã đăng nhập nếu muốn
        await sessionStore.updateSession(sessionId, {
          isLoggedIn: true,
          userInfo,
        });

        console.log(`Đã gửi qr-login-success đến web socket ${webSocketId}`);
      } else {
        console.log("Không tìm thấy socket web cho session:", sessionId);
      }
    });

    // Khi socket web disconnect → xóa session map
    socket.on("disconnect", async () => {
      await sessionStore.removeSocketById(socket.id);
      console.log("Socket disconnected:", socket.id);
    });
  });
};
