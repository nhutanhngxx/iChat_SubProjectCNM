const UserModel = require("../models/userModel");
const mongoose = require("mongoose");
const { uploadFile } = require("../services/upload-file");
const User = require("../schemas/UserDetails");

const UserController = {
  updateInfoUser: async (req, res) => {
    try {
      const { full_name, gender, dob } = req.body;
      const { id } = req.params;

      let avatarUrl, coverUrl;

      console.log("FILES RECEIVED:", Object.keys(req.files || {}));
      console.log("FULL FILES OBJECT:", req.files);

      // Xử lý avatar
      if (req.files && req.files.avatar && req.files.avatar.length > 0) {
        avatarUrl = await uploadFile(req.files.avatar[0]);
      } else {
        console.log("Không có avatar", req.files?.avatar);
      }

      // Xử lý cover
      if (req.files && req.files.cover && req.files.cover.length > 0) {
        coverUrl = await uploadFile(req.files.cover[0]);
      } else {
        console.log("Không có cover", req.files?.cover);
      }

      const updateData = {
        full_name,
        gender,
        dob,
      };
      console.log(avatarUrl);
      console.log(coverUrl);

      if (avatarUrl) updateData.avatar_path = avatarUrl;
      if (coverUrl) updateData.cover_path = coverUrl;

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ message: "Lỗi cập nhật thông tin", error });
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
      res.status(statusCode).json({
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

  // Lấy tất cả người dùng
  getAllUsers: async (req, res) => {
    const { search } = req.query;
    const currentUserId = req.user?.id;
    try {
      const users = await UserModel.getAllUsers(search, currentUserId);
      res.json({ status: "ok", users });
    } catch (error) {
      console.error("Lỗi tìm kiếm người dùng:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  },
};

module.exports = UserController;
