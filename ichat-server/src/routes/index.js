const express = require("express");
const router = express.Router();

// Import các routes
const authRoutes = require("./authRoutes");
const groupRoutes = require("./groupRoutes");
const messageRoutes = require("./messageRoutes");

// Đăng ký các routes - prefix
router.use("/auth", authRoutes);
router.use("/groups", groupRoutes);
router.use("/messages", messageRoutes);

// Route mặc định
router.get("/", (req, res) => {
  res.send({ status: "Server started" });
});

module.exports = router;
