const sessionService = require("../services/qrSessionService");
const sessionStore = require("../utils/sessionStore");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/UserDetails");

exports.qrLogin = async (req, res) => {
  const { sessionId, userInfo } = req.body; // userInfo từ mobile (giả sử đã đăng nhập)
  const isValid = await sessionService.validateAndLogin(sessionId, userInfo);

  if (!isValid) {
    return res.status(400).json({ message: "Invalid sessionId" });
  }

  const socketId = await sessionStore.getSocketId(sessionId);
  if (socketId && req.io) {
    req.io.to(socketId).emit("qr-login-success", {
      message: "Login success",
      userInfo,
    });
  }

  res.json({ message: "Gửi thành công" });
};

exports.getQRSession = async (req, res) => {
  const sessionId = await sessionService.generateSession();
  res.json({ sessionId });
};

exports.confirmLogin = async (req, res) => {
  const { sessionId } = req.body;
  const session = await sessionStore.getSession(sessionId);
  console.log("📦 Lấy session từ Redis của controller:", sessionId, session);
  if (!session || !session.isLoggedIn || !session.userInfo) {
    // Kiểm tra session đã đăng nhập chưa
    console.log(
      "🚫 Session không hợp lệ hoặc chưa đăng nhập từ mobile:",
      sessionId
    );

    return res
      .status(400)
      .json({ message: "Session chưa đăng nhập từ mobile" });
  }
  // Trả lại token (demo)
  console.log("✅ Xác nhận thành công từ mobile:", sessionId, session.userInfo);
  const token = jwt.sign({ id: session.userInfo.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  // Xóa sessionId khỏi Redis nếu cần
  await sessionStore.deleteSession(sessionId);
  res.json({
    message: "Xác nhận thành công",
    token: token,
    user: session.userInfo,
  });
};
exports.getMe = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Thiếu token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Tùy hệ thống bạn, ở đây có thể là lấy từ DB
    const userId = decoded.id; // ID người dùng từ token
    const user = await User.findById(userId).select("-password"); //Bỏ password ra khỏi kết quả
    // const user = {
    //   id: decoded.id,
    //   phone: decoded.phone || "0123",
    //   full_name: "Demo",
    // };
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};
