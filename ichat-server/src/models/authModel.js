const User = require("../schemas/UserDetails");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const authModel = {
  // Kiểm tra số điện thoại đã tồn tại hay chưa
  checkExistedPhone: async (phone) => {
    try {
      const exists = await User.exists({ phone }).lean();
      return exists;
    } catch (error) {
      console.error("Lỗi kiểm tra số điện thoại:", error);
      throw new Error("Lỗi kiểm tra số điện thoại");
    }
  },

  // Đăng ký người dùng mới
  register: async ({ phone, password, fullName, dob, gender }) => {
    const hashedPassword = await bcrypt.hash(password, 10); // Mã hóa mật khẩu
    try {
      const newUser = await User.create({
        phone,
        password: hashedPassword,
        full_name: fullName,
        dob,
        gender,
        avatar_path:
          "https://nhutanhngxx.s3.ap-southeast-1.amazonaws.com/sdwy-1744418405602-blob",
      });
      return newUser;
    } catch (error) {
      console.error("Lỗi tạo người dùng:", error);
      throw new Error("Lỗi tạo người dùng");
    }
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      return {
        status: "error",
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      };
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          status: "error",
          message: "Không tìm thấy người dùng.",
        };
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return {
          status: "error",
          message: "Mật khẩu hiện tại không đúng.",
        };
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      await user.save();

      return {
        status: "ok",
        message: "Đổi mật khẩu thành công.",
      };
    } catch (error) {
      return {
        status: "error",
        message: "Lỗi máy chủ.",
      };
    }
  },
  resetPassword: async (phone, newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      return {
        status: "error",
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
      };
    }

    try {
      const user = await User.findOne({ phone });

      if (!user) {
        return {
          status: "error",
          message: "Không tìm thấy người dùng.",
        };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      await user.save();

      return {
        status: "ok",
        message:
          "Nếu số điện thoại tồn tại, bạn sẽ nhận được thông báo thay đổi mật khẩu.",
      };
    } catch (error) {
      return { status: "error", message: error.message };
    }
  },
  findUserByPhone: async (phone) => await User.findOne({ phone }).lean(),
  deleteAccount: async (userId, password) => {
    const user = await User.findById(userId);
    if (!user)
      return { status: "error", message: "Không tìm thấy người dùng." };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { status: "error", message: "Mật khẩu không đúng." };

    await User.findByIdAndDelete(userId);
    return { status: "ok", message: "Tài khoản đã được xóa." };
  },

  updatePhone: async (userId, newPhone) => {
    await User.updateOne({ _id: userId }, { phone: newPhone });
  },
};

module.exports = authModel;
