const express = require("express");
const router = express.Router();

// Import các routes
const authRoutes = require("./authRoutes");
const groupRoutes = require("./groupRoutes");

// Đăng ký các routes - prefix
router.use("/auths", authRoutes);
router.use("/groups", groupRoutes);

// Route mặc định
router.get("/", (req, res) => {
  res.send({ status: "Server started" });
});

module.exports = router;
