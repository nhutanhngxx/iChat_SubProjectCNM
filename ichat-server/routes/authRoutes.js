const express = require("express");
const router = express.Router();
import axios from "axios";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const textflow = require("textflow.js");

const User = require("../models/UserDetails");
const OTP = require("../models/OTP");

// Gửi mã OTP theo số điện thoại
// router.post("/send-otp", async (req, res) => {
//   try {
//     const { phone } = req.body;

//     // Kiểm tra số điện thoại hợp lệ
//     if (!phone || !/^\+?[1-9]\d{9,14}$/.test(phone)) {
//       return res
//         .status(400)
//         .json({ status: "error", message: "Invalid phone number" });
//     }

//     // Kiểm tra số điện thoại đã tồn tại
//     const existingUser = await User.findOne({ phone }).select("phone").lean();
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ status: "error", message: "Phone number already exists" });
//     }

//     // Tạo mã OTP ngẫu nhiên và lưu vào database
//     const otp = Math.floor(100000 + Math.random() * 900000);
//     const bcryptOTP = await bcrypt.hash(otp.toString(), 10);
//     await OTP.create({
//       phone,
//       otp: bcryptOTP,
//       created_at: new Date().now(),
//     });

//     // Gửi OTP qua SMS
//     try {
//       const textflowRes = await axios.post(
//         "https://api.textflow.io/sms/send",
//         {
//           sender_id: "iChat",
//           phone,
//           message: `Mã xác thực của bạn là ${otp}. Vui lòng không cung cấp mã này cho người khác.Mã này có hiệu lực trong vòng 5 phút.`,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.TEXTFLOW_API_KEY}`,
//           },
//         }
//       );

//       console.log("Textflow response:", textflowRes.data);

//       if (textflowRes.data.status === "ok") {
//         res.json({ status: "ok", message: "OTP sent successfully" });
//       } else {
//         res.status(500).json({
//           status: "error",
//           message: "Error sending OTP SMS",
//           data: textflowRes.data,
//         });
//       }
//     } catch (error) {
//       console.error("Error sending OTP SMS:", error);
//       res.json({
//         message: "OTP generated but SMS delivery may have failed",
//       });
//     }
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// });

// Xác thực OTP
router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ phone });
    if (!otpRecord)
      return res.status(404).json({ status: "error", message: "Invalid OTP" });

    // Verify OTP
    const isValid = await bcrypt.compare(otp.toString(), otpRecord.otp);
    if (!isValid)
      return res.status(401).json({ status: "error", message: "Invalid OTP" });

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

    res.json({ status: "ok", message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Đăng ký tài khoản
router.post("/register", async (req, res) => {
  const { tempToken, phone, password, fullName, dob, gender } = req.body;

  let decodedToken;
  try {
    decodedToken = jwt.verify(tempToken, process.env.JWT_SECRET);
    console.log("Decode Token: ", decodedToken);
  } catch (error) {
    return res.status(401).json({ status: "error", message: "Invalid token" });
  }

  // if (!decodedToken.verify || !decodedToken.phone) {
  //   return res
  //     .status(401)
  //     .json({ status: "error", message: "Phone not verified" });
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
    .json({ status: "ok", message: "User created", data: newUser });
});

module.exports = router;
