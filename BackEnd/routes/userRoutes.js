const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserDetails");
require("dotenv").config(); // Đọc JWT_SECRET từ .env

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
      const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.send({
        status: "ok",
        token,
        user: {
          id: user._id,
          full_name: user.full_name,
          gender: user.gender,
          dob: user.dob,
          phone: user.phone,
          avatar_path: user.avatar_path,
          // cover_path: user.cover_path,
          // status: user.status,
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
// app.post("/login", async (req, res) => {

//     const { phone, password } = req.body;
//     const user = await User.findOne({ phone });

//     if (!user) {
//       return res
//         .status(400)
//         .json({ status: "error", message: "User does not exist" });
//     }

//     if (await bcrypt.compare(password, user.password)) {
//       const token = jwt.sign({ phone: user.phone, id: user._id }, JWT_SECRET, {
//         expiresIn: "1h",
//       });
//       return res.send({
//         status: "ok",
//         token,
//         user: {
//           id: user._id,
//           full_name: user.full_name,
//           phone: user.phone,
//           avatar_path: user.avatar_path,
//         },
//       });
//     } else {
//       return res
//         .status(400)
//         .json({ status: "error", message: "Invalid password" });
//     }
//   });
// Lấy thông tin User từ token
router.post("/userdata", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ phone: decoded.phone });

    if (!user)
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });

    res.json({ status: "ok", user });
  } catch (error) {
    res.status(401).json({ status: "error", message: "Invalid token" });
  }
});
//get all users
router.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

module.exports = router;
