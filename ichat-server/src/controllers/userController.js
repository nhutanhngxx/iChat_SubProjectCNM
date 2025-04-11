// const User = require("../schemas/UserDetails");

// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const UserController = {
//   // Cập nhật thông tin người dùng
//   updateInfoUser: async (req, res) => {
//     try {
//       const userId = req.params.id;
//       const updateData = req.body;

//       // Các trường cho phép cập nhật
//       const allowedUpdates = ["full_name", "gender", "dob"];

//       // Lọc chỉ lấy các trường được phép cập nhật
//       const updates = Object.keys(updateData)
//         .filter((key) => allowedUpdates.includes(key))
//         .reduce((obj, key) => {
//           obj[key] = updateData[key];
//           return obj;
//         }, {});

//       // Validation cơ bản phía server
//       if (!updates.full_name || updates.full_name.trim() === "") {
//         return res.status(400).json({
//           success: false,
//           message: "Họ tên không được để trống",
//         });
//       }

//       // Thêm timestamp cho updated_at
//       updates.updated_at = Date.now();

//       // Tìm và cập nhật user
//       const user = await User.findByIdAndUpdate(
//         userId,
//         { $set: updates },
//         {
//           new: true, // Trả về document đã cập nhật
//           runValidators: true, // Chạy validation của schema
//         }
//       );

//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           message: "Không tìm thấy người dùng",
//         });
//       }

//       res.status(200).json({
//         success: true,
//         message: "Cập nhật thông tin thành công",
//         data: {
//           full_name: user.full_name,
//           gender: user.gender,
//           dob: user.dobFormatted || user.dob, // Nếu không có dobFormatted thì trả dob gốc
//           updated_at: user.updated_at,
//         },
//       });
//     } catch (error) {
//       if (error.name === "ValidationError") {
//         return res.status(400).json({
//           success: false,
//           message: "Dữ liệu không hợp lệ",
//           errors: error.errors,
//         });
//       }
//       if (error.code === 11000) {
//         return res.status(400).json({
//           success: false,
//           message: "Số điện thoại đã được sử dụng",
//         });
//       }
//       console.error("Lỗi server:", error);
//       res.status(500).json({
//         success: false,
//         message: "Lỗi server",
//         error: error.message,
//       });
//     }
//   },

//   //   Lấy thông tin người dùng từ bearer token
//   getUserFromToken: async (req, res) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res
//         .status(401)
//         .json({ status: "error", message: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findOne({ phone: decoded.phone });

//       if (!user) {
//         return res
//           .status(404)
//           .json({ status: "error", message: "User not found" });
//       }

//       res.json({ status: "ok", user });
//     } catch (error) {
//       res
//         .status(401)
//         .json({ status: "error", message: "Invalid or expired token" });
//     }
//   },

//   //   Tìm người dùng theo Id
//   getUserById: async (req, res) => {
//     const { id } = req.params;
//     try {
//       let user = await User.findById(id);
//       if (!user) {
//         return res
//           .status(404)
//           .json({ status: "error", message: "User not found" });
//       }
//       res.json({ status: "ok", user });
//     } catch (error) {
//       res.status(500).json({ status: "error", message: error.message });
//     }
//   },

//   //   Lấy tất cả user từ database (Tìm kiếm nếu tìm thấy)
//   getAllUsers: async (req, res) => {
//     const { search } = req.query;

//     try {
//       let users;
//       if (!search) {
//         users = await User.find(); // Nếu không có search, trả về toàn bộ user
//       } else if (/^\d+$/.test(search)) {
//         // Nếu chỉ chứa số, tìm chính xác theo số điện thoại
//         users = await User.find({ phone: search });
//       } else {
//         // Nếu chứa ký tự, tìm tương đối theo full_name
//         users = await User.find({
//           full_name: { $regex: search, $options: "i" },
//         });
//       }

//       res.json({ status: "ok", users });
//     } catch (error) {
//       res.status(500).json({ status: "error", message: error.message });
//     }
//   },
// };

// module.exports = UserController;
const UserModel = require("../models/userModel");

const UserController = {
  updateInfoUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const updateData = req.body;
      const updatedUser = await UserModel.updateInfoUser(userId, updateData);

      res.status(200).json({
        success: true,
        message: "Cập nhật thông tin thành công",
        data: updatedUser,
      });
    } catch (error) {
      if (error.type === "Validation") {
        return res.status(400).json({ success: false, message: error.message });
      }
      if (error.type === "NotFound") {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.name === "ValidationError") {
        return res
          .status(400)
          .json({
            success: false,
            message: "Dữ liệu không hợp lệ",
            errors: error.errors,
          });
      }
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ success: false, message: "Số điện thoại đã được sử dụng" });
      }
      res
        .status(500)
        .json({ success: false, message: "Lỗi server", error: error.message });
    }
  },
  getUserFromToken: async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ status: "error", message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const user = await UserModel.getUserFromToken(token);
      res.json({ status: "ok", user });
    } catch (error) {
      const statusCode = error.type === "NotFound" ? 404 : 401;
      res
        .status(statusCode)
        .json({
          status: "error",
          message: error.message || "Invalid or expired token",
        });
    }
  },

  getUserById: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await UserModel.getUserById(id);
      res.json({ status: "ok", user });
    } catch (error) {
      const statusCode = error.type === "NotFound" ? 404 : 500;
      res.status(statusCode).json({ status: "error", message: error.message });
    }
  },

  getAllUsers: async (req, res) => {
    const { search } = req.query;
    try {
      const users = await UserModel.getAllUsers(search);
      res.json({ status: "ok", users });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  },
};

module.exports = UserController;
