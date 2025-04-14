const User = require("../schemas/UserDetails");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { search } = require("../routes/messageRoutes");

// Hàm xử lý cập nhật user
const updateInfoUser = async (userId, updateData) => {
  const allowedUpdates = [
    "full_name",
    "gender",
    "dob",
    "avatar_path",
    "cover_path",
  ];

  // Lọc các trường được cập nhật
  const updates = Object.keys(updateData)
    .filter((key) => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = updateData[key];
      return obj;
    }, {});

  // // Kiểm tra dữ liệu hợp lệ
  // if (!updates.full_name || updates.full_name.trim() === "") {
  //   throw { type: "Validation", message: "Họ tên không được để trống" };
  // }

  updates.updated_at = Date.now();

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw { type: "NotFound", message: "Không tìm thấy người dùng" };
  }

  return {
    full_name: user.full_name,
    gender: user.gender,
    dob: user.dobFormatted || user.dob,
    avatar_path: user.avatar_path,
    cover_path: user.cover_path,
    updated_at: user.updated_at,
  };
};

// Hàm lấy user từ token
const getUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ phone: decoded.phone });

  if (!user) throw { type: "NotFound", message: "User not found" };

  return user;
};

// Lấy user theo ID
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw { type: "NotFound", message: "User not found" };
  return user;
};

// Lấy tất cả user (có thể tìm kiếm)
const getAllUsers = async (search) => {
  try {
    let users;
    if (!search) {
      users = await User.find();
    } else if (/^\+?\d+$/.test(search)) {
      // Nếu số điện thoại, tìm chính xác theo phone
      users = await User.find({ phone: search });
    } else {
      // Nếu không phải số, tìm theo tên
      users = await User.find({
        full_name: { $regex: search, $options: "i" }, // 'i' là tìm kiếm không phân biệt chữ hoa/thường
      });
    }
    return users;
  } catch (error) {
    throw new Error(`Lỗi khi tìm kiếm người dùng: ${error.message}`);
  }
};

module.exports = {
  updateInfoUser,
  getUserFromToken,
  getUserById,
  getAllUsers,
};
