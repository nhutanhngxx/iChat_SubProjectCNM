const AuthModel = require("../models/authModel");
const validators = require("../utils/validators");

const authController = {
  // Kiểm tra số điện thoại đã tồn tại hay chưa
  checkExistedPhone: async (req, res) => {
    try {
      const { phone } = req.body;

      // Kiểm tra số điện thoại hợp lệ
      if (!phone || !validators.validatePhone(phone)) {
        return res
          .status(400)
          .json({ status: "error", message: "Số điện thoại không hợp lệ." });
      }

      // Kiểm tra số điện thoại đã tồn tại trong cơ sở dữ liệu hay chưa
      const existingUser = await AuthModel.checkExistedPhone(phone);
      if (existingUser) {
        // Nếu số điện thoại đã tồn tại, trả về lỗi
        return res.status(400).json({
          status: "error",
          message: "Số điện thoại này đã được đăng ký.",
        });
      } else {
        // Nếu số điện thoại chưa tồn tại, gửi OTP
        return res.json({
          status: "ok",
          data: { phone },
          message: "OTP đã được gửi đến số điện thoại của bạn.",
        });
      }
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  // Đăng ký người dùng mới
  register: async (req, res) => {
    const { tempToken, phone, password, fullName, dob, gender } = req.body;

    // Kiểm tra token có tồn tại hay không
    if (!tempToken) {
      return res.status(400).json({
        status: "error",
        message: "Token không hợp lệ. Vui lòng thử lại.",
      });
    }

    try {
      // Tạo người dùng mới
      await AuthModel.register({ phone, password, fullName, dob, gender });
      return res.status(201).json({
        status: "ok",
        message: "Người dùng đã được tạo.",
        data: newUser,
      });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  // Đăng nhập
  login: async (req, res) => {},

  // Đăng xuất
  logout: async (req, res) => {},
};

module.exports = authController;
