const User = require("../schemas/UserDetails");

const bcrypt = require("bcryptjs");

const authModel = {
  // Kiểm tra số điện thoại đã tồn tại hay chưa
  checkExistedPhone: async (phone) => {
    try {
      const exists = await User.exists({ phone }).lean();
      return !exists;
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
      });
      return newUser;
    } catch (error) {
      console.error("Lỗi tạo người dùng:", error);
      throw new Error("Lỗi tạo người dùng");
    }
  },
};

module.exports = authModel;
