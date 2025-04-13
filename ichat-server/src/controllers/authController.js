const AuthModel = require("../models/authModel");
const validators = require("../utils/validators");
const sessionService = require("../services/qrSessionService");
const sessionStore = require("../utils/sessionStore");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../schemas/UserDetails");
const authModel = require("../models/authModel");
const textflow = require("textflow.js");
textflow.useKey(process.env.TEXTFLOW_API_KEY);
const OTP = require("../schemas/OTP");
const phoneRegex = /^(\+84)[3-9][0-9]{8}$/;


// Tạo accesstoken
const generateAccessToken = (user) => {
  return jwt.sign({ phone: user.phone }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Tạo Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ phone: user.phone }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "1d",
  });
};

const authController = {
  // Kiểm tra số điện thoại đã tồn tại hay chưa
  checkExistedPhone: async (req, res) => {
    try {
      const { phone } = req.body;

      // Kiểm tra số điện thoại hợp lệ
      if (!phone || !validators.validatePhone(phone)) {
        return res.status(400).json({
          status: "error",
          message: "Số điện thoại không hợp lệ.",
        });
      }

      // Kiểm tra số điện thoại đã tồn tại trong cơ sở dữ liệu hay chưa
      const existingUser = await AuthModel.checkExistedPhone(phone);
      if (existingUser) {
        // Nếu số điện thoại đã tồn tại, trả về lỗi
        return res.status(400).json({
          status: "error",
          message: "Số điện thoại này đã được đăng ký.",
        });
      } else {
        // Nếu số điện thoại chưa tồn tại, gửi OTP
        return res.json({
          status: "ok",
          data: { phone },
          message: "OTP đã được gửi đến số điện thoại của bạn.",
        });
      }
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  // Đăng ký người dùng mới
  register: async (req, res) => {
    const { tempToken, phone, password, fullName, dob, gender } = req.body;

    // Kiểm tra token có tồn tại hay không
    if (!tempToken) {
      return res.status(400).json({
        status: "error",
        message: "Token không hợp lệ. Vui lòng thử lại.",
      });
    }

    try {
      // Tạo người dùng mới
      const newUser = authModel.register({
        phone,
        password,
        fullName,
        dob,
        gender,
      });
      return res.status(201).json({
        status: "ok",
        message: "Người dùng đã được tạo.",
        data: newUser,
      });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  //   Đăng nhập
  login: async (req, res) => {
    const { phone, password } = req.body;
    console.log("Đăng nhập với số điện thoại:", phone);
    try {
      const user = await User.findOne({ phone });
      if (!user)
        return res
          .status(400)
          .json({ status: "error", message: "User does not exist" });

      if (await bcrypt.compare(password, user.password)) {
        // const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET, {
        //   expiresIn: "1h",
        // });
        if (!process.env.JWT_SECRET) {
          return res
            .status(500)
            .json({ status: "error", message: "JWT_SECRET is missing" });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        // Lưu refreshToken vào cookie
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true, // Đặt thành false nếu chạy localhost (cần HTTPS khi deploy)
          sameSite: "Strict",
          maxAge: 24 * 60 * 60 * 1000, // 1 ngày
        });
        await User.findByIdAndUpdate(user._id, { status: "Online" });
        return res.send({
          status: "ok",
          accessToken,
          user: {
            id: user._id,
            full_name: user.full_name,
            gender: user.gender,
            dob: user.dob,
            phone: user.phone,
            avatar_path: user.avatar_path,
            cover_path: user.cover_path,
            status: user.status,
            dobFormatted: user.dobFormatted,
          },
        });
      } else {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid password" });
      }
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  //   Đăng xuất
  logout: async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res
          .status(400)
          .json({ status: "error", message: "Missing userId" });
      }

      await User.findByIdAndUpdate(userId, { status: "Offline" });

      res.clearCookie("refreshToken");
      res.json({ status: "ok", message: "User logged out successfully" });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  //   Refresh token
  refreshToken: (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ status: "error", message: "No refresh token provided" });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .json({ status: "error", message: "Invalid refresh token" });
        }

        try {
          const user = await User.findOne({ phone: decoded.phone });
          if (!user) {
            return res
              .status(404)
              .json({ status: "error", message: "User not found" });
          }

          const newAccessToken = generateAccessToken(user);
          res.json({ status: "ok", accessToken: newAccessToken });
        } catch (error) {
          res.status(500).json({ status: "error", message: error.message });
        }
      }
    );
  },
  qrLogin: async (req, res) => {
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
  },

  getQRSession: async (req, res) => {
    const sessionId = await sessionService.generateSession();
    res.json({ sessionId });
  },

  confirmLogin: async (req, res) => {
    const { sessionId } = req.body;
    const session = await sessionStore.getSession(sessionId);
    console.log("Lấy session từ Redis của controller:", sessionId, session);
    if (!session || !session.isLoggedIn || !session.userInfo) {
      // Kiểm tra session đã đăng nhập chưa
      console.log(
        "Session không hợp lệ hoặc chưa đăng nhập từ mobile:",
        sessionId
      );

      return res
        .status(400)
        .json({ message: "Session chưa đăng nhập từ mobile" });
    }
    // Trả lại token (demo)
    console.log("Xác nhận thành công từ mobile:", sessionId, session.userInfo);
    const token = jwt.sign(
      { id: session.userInfo.id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    // Xóa sessionId khỏi Redis nếu cần
    await sessionStore.deleteSession(sessionId);
    res.json({
      message: "Xác nhận thành công",
      token: token,
      user: session.userInfo,
    });
  },
  getMe: async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Thiếu token" });

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user)
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updatePhone: async (req, res) => {
    const { userId, newPhone } = req.body;
    try {
      await authModel.updatePhone(userId, newPhone);
      return res.json({
        status: "ok",
        message: "Số điện thoại đã được cập nhật.",
      });
    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: "Lỗi server khi cập nhật số điện thoại.",
      });
    }
  },

  deleteAccount: async (req, res) => {
    const { userId, password } = req.body;
    const result = await authModel.deleteAccount(userId, password);
    return res.status(result.status === "ok" ? 200 : 400).json(result);
  },

  verifyOtp: async (req, res) => {
    const { phone, otp } = req.body;
    try {
      const otpRecord = await OTP.findOne({ phone });
      if (!otpRecord || otp.toString() !== otpRecord.otp) {
        return res.status(401).json({
          status: "error",
          message: "Mã OTP không đúng hoặc đã hết hạn",
        });
      }

      const tempToken = jwt.sign(
        { phone, verify: true },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      await OTP.deleteOne({ _id: otpRecord._id });

      return res.json({
        status: "ok",
        data: { message: "OTP verified", phone, tempToken },
      });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  verifyPassword: async (req, res) => {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ isValid: false });
      }

      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(400).json({ isValid: false });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ isValid: false });
      }

      return res.status(200).json({ isValid: true });
    } catch (error) {
      console.error("Error in verify-password:", error);
      return res.status(500).json({ isValid: false });
    }
  },
};

authController.changePassword = async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    const result = await authModel.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    if (result.status === "error") {
      return res.status(400).json({ status: "error", message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

authController.resetPassword = async (req, res) => {
  const { phone, newPassword } = req.body;

  try {
    const result = await authModel.resetPassword(phone, newPassword);

    if (result.status === "error") {
      return res.status(400).json({ status: "error", message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

authController.confirmPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    const regex = /^(\+84)[3-9][0-9]{8}$/;
    if (!phone || !regex.test(phone.trim())) {
      return res
        .status(400)
        .json({ status: "error", message: "Số điện thoại không hợp lệ." });
    }
    const result = await authModel.checkExistedPhone(phone);

    if (result.status === "error") {
      return res.status(400).json({ status: "error", message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
module.exports = authController;
