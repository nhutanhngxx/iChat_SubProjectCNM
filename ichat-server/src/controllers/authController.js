const AuthModel = require("../models/authModel");
const validators = require("../utils/validators");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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
        return res
          .status(400)
          .json({ status: "error", message: "Số điện thoại không hợp lệ." });
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
      await AuthModel.register({ phone, password, fullName, dob, gender });
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
};

module.exports = authController;
