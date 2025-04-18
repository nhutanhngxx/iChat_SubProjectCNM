const express = require("express");
const router = express.Router();

// Import các routes
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const groupRoutes = require("./groupRoutes");
const messageRoutes = require("./messageRoutes");
const friendshipRoutes = require("./friendRoutes");
const tokenCallVideoRoutes = require("./tokenCallVideo"); // Import routes cho video call

// Đăng ký các routes - prefix
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/groups", groupRoutes);
router.use("/messages", messageRoutes);
router.use("/friendships", friendshipRoutes);
router.use("/video-call", tokenCallVideoRoutes); // Đăng ký routes cho video

// Route mặc định
router.get("/", (req, res) => {
  res.send({ status: "Server started" });
});

module.exports = router;
