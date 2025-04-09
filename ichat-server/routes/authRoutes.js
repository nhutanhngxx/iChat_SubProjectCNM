const express = require("express");
const router = express.Router();
const axios = require("axios");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const textflow = require("textflow.js");
textflow.useKey(process.env.TEXTFLOW_API_KEY);

const User = require("../models/UserDetails");
const OTP = require("../models/OTP");

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

router.post("/confirm-phone", async (req, res) => {
  try {
    const { phone } = req.body;
    const regex = /^(\+84)[3-9][0-9]{8}$/;
    if (!phone || !regex.test(phone.trim())) {
      return res
        .status(400)
        .json({ status: "error", message: "Số điện thoại không hợp lệ." });
    }
    const existingUser = await User.findOne({ phone }).select("phone").lean();

    if (existingUser) {
      return res.json({
        status: "ok",
        data: {
          message: "OTP đã được gửi đến số điện thoại của bạn.",
          phone,
        },
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: "Số điện thoại này chưa được đăng ký.",
      });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  const { phone, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      status: "error",
      message: "Mật khẩu phải có ít nhất 6 ký tự.",
    });
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Không tìm thấy người dùng.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      status: "ok",
      message:
        "Nếu số điện thoại tồn tại, bạn sẽ nhận được thông báo thay đổi mật khẩu.",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

router.put("/change-password", async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      status: "error",
      message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Không tìm thấy người dùng." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: "error", message: "Mật khẩu hiện tại không đúng." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return res
      .status(200)
      .json({ status: "ok", message: "Đổi mật khẩu thành công." });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Lỗi máy chủ." });
  }
});

router.delete("/auth/delete-account", async (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "Thiếu thông tin cần thiết." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Không tìm thấy người dùng." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: "error", message: "Mật khẩu không đúng." });
    }

    await User.findByIdAndDelete(userId); // Hard delete: Sẽ xóa tài khoản vĩnh viễn
    // Hoặc nếu muốn soft delete: Xóa tài khoản mà không xóa dữ liệu, chỉ cần đánh dấu là đã xóa
    // user.isDeleted = true;
    // await user.save();

    return res
      .status(200)
      .json({ status: "ok", message: "Tài khoản đã được xóa." });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Đã xảy ra lỗi." });
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

router.put("/update-phone", async (req, res) => {
  const { userId, newPhone } = req.body;
  try {
    await User.updateOne({ _id: userId }, { phone: newPhone });
    return res.json({
      status: "ok",
      message: "Số điện thoại đã được cập nhật.",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Lỗi server khi cập nhật số điện thoại.",
    });
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
