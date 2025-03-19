const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserDetails");
require("dotenv").config(); // Đọc JWT_SECRET từ .env
const cookieParser = require("cookie-parser");
router.use(cookieParser());
// Đăng ký tài khoản
router.post("/register", async (req, res) => {
  const {
    full_name,
    gender,
    dob,
    phone,
    password,
    avatar_path,
    cover_path,
    status,
  } = req.body;

  try {
    const oldUser = await User.findOne({ phone });
    if (oldUser)
      return res
        .status(400)
        .json({ status: "error", message: "User already exists" });

    const encryptedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      full_name,
      gender,
      dob,
      phone,
      password: encryptedPassword,
      avatar_path: avatar_path || "",
      cover_path: cover_path || "",
      status: status || "Offline",
    });

    res
      .status(201)
      .json({ status: "ok", message: "User created", user: newUser });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Hàm tạo Access Token
const generateAccessToken = (user) => {
  return jwt.sign({ phone: user.phone }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Hàm tạo Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ phone: user.phone }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "1d",
  });
};

// Đăng nhập
router.post("/login", async (req, res) => {
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
});
// Làm mới accessToken
router.post("/refresh-token", (req, res) => {
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
});

// Lấy thông tin User từ Bearer Token
router.post("/userdata", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ phone: decoded.phone });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res.json({ status: "ok", user });
  } catch (error) {
    res
      .status(401)
      .json({ status: "error", message: "Invalid or expired token" });
  }
});

// Lấy tất cả user từ database (Tìm kiếm nếu tìm thấy)
router.get("/users", async (req, res) => {
  const { search } = req.query;

  try {
    let users;
    if (!search) {
      users = await User.find(); // Nếu không có search, trả về toàn bộ user
    } else if (/^\d+$/.test(search)) {
      // Nếu chỉ chứa số, tìm chính xác theo số điện thoại
      users = await User.find({ phone: search });
    } else {
      // Nếu chứa ký tự, tìm tương đối theo full_name
      users = await User.find({ full_name: { $regex: search, $options: "i" } });
    }

    res.json({ status: "ok", users });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});
// Đăng xuất
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.json({ status: "ok", message: "Logged out successfully" });
});

module.exports = router;
