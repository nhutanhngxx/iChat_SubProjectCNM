const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Schema/UserDetails');
require('dotenv').config(); // Đọc JWT_SECRET từ .env

// Đăng ký tài khoản
router.post("/register", async (req, res) => {
    const { full_name, gender, dob, phone, password, avatar, status } = req.body;

    try {
        const oldUser = await User.findOne({ phone });
        if (oldUser) return res.status(400).json({ status: "error", message: "User already exists" });

        const encryptedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            full_name, gender, dob, phone,
            password: encryptedPassword,
            avatar: avatar || "",
            status: status || "Offline"
        });

        res.status(201).json({ status: "ok", message: "User created", user: newUser });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Đăng nhập
router.post("/login", async (req, res) => {
    const { phone, password } = req.body;

    try {
        const user = await User.findOne({ phone });
        if (!user) return res.status(400).json({ status: "error", message: "User does not exist" });

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET, { expiresIn: "1h" });
            return res.json({ status: "ok", token });
        } else {
            return res.status(400).json({ status: "error", message: "Invalid password" });
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

// Lấy thông tin User từ token
router.post("/userdata", async (req, res) => {
    const { token } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ phone: decoded.phone });

        if (!user) return res.status(404).json({ status: "error", message: "User not found" });

        res.json({ status: "ok", user });
    } catch (error) {
        res.status(401).json({ status: "error", message: "Invalid token" });
    }
});

module.exports = router;
