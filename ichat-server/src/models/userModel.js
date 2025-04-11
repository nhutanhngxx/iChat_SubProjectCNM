const User = require("../schemas/UserDetails");
const jwt = require("jsonwebtoken");

// Hàm xử lý cập nhật user
const updateInfoUser = async (userId, updateData) => {
  const allowedUpdates = ["full_name", "gender", "dob", "avatar_path"];

  const updates = Object.keys(updateData)
    .filter((key) => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = updateData[key];
      return obj;
    }, {});

  // if (!updates.full_name || updates.full_name.trim() === "") {
  //   return res.status(400).json({
  //     success: false,
  //     message: "Họ tên không được để trống",
  //   });
  // }

  updates.updated_at = Date.now();

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) throw { type: "NotFound", message: "Không tìm thấy người dùng" };

  return {
    full_name: user.full_name,
    gender: user.gender,
    dob: user.dobFormatted || user.dob,
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
  if (!search) return await User.find();

  if (/^\d+$/.test(search)) {
    return await User.find({ phone: search });
  }

  return await User.find({
    full_name: { $regex: search, $options: "i" },
  });
};

module.exports = {
  updateInfoUser,
  getUserFromToken,
  getUserById,
  getAllUsers,
};
