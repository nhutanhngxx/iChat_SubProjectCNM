const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

const API_KEY = process.env.VIDEOSDK_API_KEY;
const SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY;

router.get("/get-token", (req, res) => {
  try {
    const payload = {
      apikey: API_KEY,
      permissions: ["allow_join", "allow_mod"], // hoặc chỉ "allow_join"
    };

    const token = jwt.sign(payload, SECRET_KEY, {
      algorithm: "HS256",
      expiresIn: "24h",
      issuer: "videosdk.live",
    });

    res.json({ token });
  } catch (err) {
    console.error("Token generation error:", err.message);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

module.exports = router;
