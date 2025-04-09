const express = require("express");
const router = express.Router();
const axios = require("axios");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const textflow = require("textflow.js");
const authController = require("../controllers/authController");
textflow.useKey(process.env.TEXTFLOW_API_KEY);

const User = require("../models/UserDetails");
const OTP = require("../models/OTP");

router.get("/qr-session", authController.getQRSession);
router.post("/qr-login", authController.qrLogin);
router.post("/confirm-login", authController.confirmLogin);
router.get("/me", authController.getMe);

// Kiểm tra số điện thoại đã tồn tại hay chưa
router.post("/check-existed-phone", async (req, res) => {
  try {
    const { phone } = req.body;
    const regex = /^(\+84)[3-9][0-9]{8}$/;

    // Kiểm tra số điện thoại hợp lệ
    if (!phone || !regex.test(phone.trim())) {
      return res
        .status(400)
        .json({ status: "error", message: "Số điện thoại không hợp lệ." });
    }

    const existingUser = await User.findOne({ phone }).select("phone").lean();
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Số điện thoại này đã được đăng ký.",
      });
    } else {
      return res.json({
        status: "ok",
        data: {
          message: "OTP đã được gửi đến số điện thoại của bạn.",
          phone,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Xác thực OTP
router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ phone });
    if (!otpRecord)
      return res.status(404).json({
        status: "error",
        message: "Mã OTP không đúng hoặc đã hết hạn!",
      });

    // Verify OTP
    const isValid = otp.toString() === otpRecord.otp;
    if (!isValid)
      return res.status(401).json({
        status: "error",
        message: "Mã OTP không đúng hoặc đã hết hạn",
      });

    // Tạo token
    const tempToken = jwt.sign(
      { phone, verify: true },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Xóa OTP sau khi xác minh
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({
      status: "ok",
      data: {
        message: "OTP verified",
        phone,
        tempToken,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Đăng ký tài khoản
router.post("/register", async (req, res) => {
  const { tempToken, phone, password, fullName, dob, gender } = req.body;

  // Kiểm tra token có tồn tại hay không
  if (!tempToken) {
    return res.status(400).json({
      status: "error",
      message: "Token không hợp lệ. Vui lòng thử lại.",
    });
  }

  // Xác thực token
  // let decodedToken;
  // try {
  //   decodedToken = jwt.verify(tempToken, process.env.JWT_SECRET);
  //   console.log("Decode Token: ", decodedToken);
  // } catch (error) {
  //   return res
  //     .status(401)
  //     .json({ status: "error", message: "Token không hợp lệ!" });
  // }

  // // Kiểm tra số điện thoại đã xác thực chưa và đã đăng ký chưa
  // if (!decodedToken.verify || decodedToken.phone !== phone) {
  //   return res
  //     .status(401)
  //     .json({ status: "error", message: "Số điện thoại chưa được xác thực!" });
  // }

  const newUser = await User.create({
    phone,
    password: await bcrypt.hash(password, 10),
    full_name: fullName,
    dob,
    gender,
  });
  res
    .status(201)
    .json({ status: "ok", message: "Tài khoản đã được tạo.", data: newUser });
});

module.exports = router;
