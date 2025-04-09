const express = require("express");
const router = express.Router();

// Import các routes
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const groupRoutes = require("./groupRoutes");
const messageRoutes = require("./messageRoutes");
const friendshipRoutes = require("./friendRoutes");

// Đăng ký các routes - prefix
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/groups", groupRoutes);
router.use("/messages", messageRoutes);
router.use("/friendships", friendshipRoutes);

// Route mặc định
router.get("/", (req, res) => {
  res.send({ status: "Server started" });
});

module.exports = router;
