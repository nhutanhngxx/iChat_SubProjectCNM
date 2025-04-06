const express = require("express");
const router = express.Router();

// Import các routes
const authRoutes = require("./authRoutes");

// Đăng ký các routes - prefix
router.use("/auth", authRoutes);

// Route mặc định
router.get("/", (req, res) => {
  res.send({ status: "Server started" });
});

module.exports = router;
