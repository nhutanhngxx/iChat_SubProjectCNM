const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookieParser = require("cookie-parser");
router.use(cookieParser());
const OTP = require("../models/OTP");

// Socket.io => Real-time
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { uploadFile } = require("../services/uploadImageToS3");

const User = require("../models/UserDetails");
const Friendship = require("../models/Friendship");
const Messages = require("../models/Messages");

router.put("/update/:id", upload.single("avatar"), async (req, res) => {
  try {
    const userId = req.params.id;
    const image = req.file;

    const updateData = req.body;

    const allowedUpdates = ["full_name", "gender", "dob", "avatar_path"];
    const updates = Object.keys(updateData)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    if (!updates.full_name || updates.full_name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Họ tên không được để trống",
      });
    }

    if (image) {
      const imageUrl = await uploadFile(image);
      updates.avatar_path = imageUrl;
    }

    updates.updated_at = Date.now();

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: {
        full_name: user.full_name,
        gender: user.gender,
        dob: user.dobFormatted || user.dob,
        avatar_path: user.avatar_path,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors,
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại đã được sử dụng",
      });
    }
    console.error("Lỗi server:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Đăng ký với OTP
router.post("/register", async (req, res) => {
  const { phone, password, full_name, dob, gender } = req.body;

  try {
    // Kiểm tra OTP
    const validOtp = await OTP.findOne({ phone, otp });
    if (!validOtp)
      return res.status(400).json({ status: "error", message: "Invalid OTP" });

    // Xóa OTP sau khi xác minh
    await OTP.deleteOne({ phone });

    // Kiểm tra tài khoản đã tồn tại
    const oldUser = await User.findOne({ phone });
    if (oldUser)
      return res
        .status(400)
        .json({ status: "error", message: "User already exists" });

    const encryptedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      full_name,
      gender,
      dob,
      phone,
      password: encryptedPassword,
      avatar_path: avatar_path || "",
      cover_path: cover_path || "",
      status: status || "Offline",
    });

    res
      .status(201)
      .json({ status: "ok", message: "User created", user: newUser });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Hàm tạo Access Token
const generateAccessToken = (user) => {
  return jwt.sign({ phone: user.phone }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Hàm tạo Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ phone: user.phone }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "1d",
  });
};

// Đăng nhập
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user)
      return res
        .status(400)
        .json({ status: "error", message: "User does not exist" });

    if (await bcrypt.compare(password, user.password)) {
      if (!process.env.JWT_SECRET) {
        return res
          .status(500)
          .json({ status: "error", message: "JWT_SECRET is missing" });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Lưu refreshToken vào cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // Đặt thành false nếu chạy localhost (cần HTTPS khi deploy)
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 ngày
      });
      await User.findByIdAndUpdate(user._id, { status: "Online" });
      return res.send({
        status: "ok",
        accessToken,
        user: {
          id: user._id,
          full_name: user.full_name,
          gender: user.gender,
          dob: user.dob,
          phone: user.phone,
          avatar_path: user.avatar_path,
          cover_path: user.cover_path,
          status: user.status,
          dobFormatted: user.dobFormatted,
        },
      });
    } else {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Đăng xuất
router.post("/logout", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing userId" });
    }

    await User.findByIdAndUpdate(userId, { status: "Offline" });

    res.clearCookie("refreshToken");
    res.json({ status: "ok", message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Làm mới accessToken
router.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ status: "error", message: "No refresh token provided" });
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    async (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ status: "error", message: "Invalid refresh token" });
      }

      try {
        const user = await User.findOne({ phone: decoded.phone });
        if (!user) {
          return res
            .status(404)
            .json({ status: "error", message: "User not found" });
        }

        const newAccessToken = generateAccessToken(user);
        res.json({ status: "ok", accessToken: newAccessToken });
      } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
      }
    }
  );
});

// Lấy thông tin User từ Bearer Token
router.post("/userdata", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ status: "error", message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ phone: decoded.phone });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res.json({ status: "ok", user });
  } catch (error) {
    res
      .status(401)
      .json({ status: "error", message: "Invalid or expired token" });
  }
});

// Lấy thông tin User từ ID
router.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }
    res.json({ status: "ok", user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Lấy tất cả user từ database (Tìm kiếm nếu tìm thấy)
router.get("/users", async (req, res) => {
  const { search } = req.query;

  try {
    let users;
    if (!search) {
      users = await User.find(); // Nếu không có search, trả về toàn bộ user
    } else if (/^\d+$/.test(search)) {
      // Nếu chỉ chứa số, tìm chính xác theo số điện thoại
      users = await User.find({ phone: search });
    } else {
      // Nếu chứa ký tự, tìm tương đối theo full_name
      users = await User.find({ full_name: { $regex: search, $options: "i" } });
    }

    res.json({ status: "ok", users });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Lấy danh sách lời mời kết bạn
router.get("/received-requests/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const friendRequests = await Friendship.find({
      receiver_id: userId,
      status: "pending",
    });
    const senderIds = friendRequests.map((request) => request.sender_id);
    const senders = await User.find({ _id: { $in: senderIds } });
    const friendRequestsWithSenderInfo = friendRequests.map((request) => {
      const sender = senders.find(
        (user) => user._id.toString() === request.sender_id.toString()
      );
      return {
        id: sender._id,
        full_name: sender.full_name,
        avatar_path: sender.avatar_path,
      };
    });
    res.json({ status: "ok", friendRequests: friendRequestsWithSenderInfo });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Lấy danh sách lời mời kết bạn mà người dùng đã gửi
router.get("/sent-requests/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const friendRequests = await Friendship.find({
      sender_id: userId,
      status: "pending",
    });
    const receiverIds = friendRequests.map((request) => request.receiver_id);
    const receivers = await User.find({ _id: { $in: receiverIds } });
    const friendRequestsWithReceiverInfo = friendRequests.map((request) => {
      const receiver = receivers.find(
        (user) => user._id.toString() === request.receiver_id.toString()
      );
      return {
        id: receiver._id,
        full_name: receiver.full_name,
        avatar_path: receiver.avatar_path,
      };
    });
    res.json({ status: "ok", friendRequests: friendRequestsWithReceiverInfo });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Gửi lời mời kết bạn
router.post("/send-friend-request", async (req, res) => {
  const { sender_id, receiver_id } = req.body;

  try {
    // Kiểm tra nếu sender_id và receiver_id giống nhau
    if (sender_id === receiver_id) {
      return res.status(400).json({
        status: "error",
        message: "Không thể gửi lời mời kết bạn cho chính mình",
      });
    }

    // Kiểm tra nếu đã có mối quan hệ trước đó
    const existingFriendship = await Friendship.findOne({
      $or: [
        { sender_id, receiver_id },
        { sender_id: receiver_id, receiver_id: sender_id },
      ],
    });

    if (existingFriendship) {
      if (existingFriendship.status === "accepted") {
        return res
          .status(400)
          .json({ status: "error", message: "Hai người đã là bạn bè" });
      } else if (existingFriendship.status === "pending") {
        return res
          .status(400)
          .json({ status: "error", message: "Lời mời kết bạn đang chờ duyệt" });
      } else if (existingFriendship.status === "blocked") {
        return res.status(400).json({
          status: "error",
          message: "Bạn hoặc người kia đã chặn nhau",
        });
      }
    }

    // Tạo mới lời mời kết bạn
    const newFriendship = await Friendship.create({
      sender_id,
      receiver_id,
      status: "pending",
    });

    res.status(201).json({
      status: "ok",
      message: "Lời mời kết bạn đã được gửi",
      friendship: newFriendship,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Chấp nhận lời mời kết bạn
router.post("/accept-friend-request", async (req, res) => {
  const { sender_id, receiver_id } = req.body;

  try {
    const friendship = await Friendship.findOne({
      sender_id,
      receiver_id,
      status: "pending",
    });

    if (!friendship) {
      return res.status(400).json({
        status: "error",
        message: "Không có lời mời kết bạn nào cần chấp nhận",
      });
    }

    friendship.status = "accepted";
    await friendship.save();

    res.json({
      status: "ok",
      message: "Lời mời kết bạn đã được chấp nhận",
      friendship,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Từ chối lời mời kết bạn
router.post("/reject-friend-request", async (req, res) => {
  const { sender_id, receiver_id } = req.body;

  try {
    const friendship = await Friendship.findOneAndDelete({
      sender_id,
      receiver_id,
      status: "pending",
    });

    if (!friendship) {
      return res
        .status(400)
        .json({ status: "error", message: "Không tìm thấy lời mời để hủy" });
    }

    res.json({ status: "ok", message: "Lời mời kết bạn đã bị hủy" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Chặn người dùng
router.post("/block-user", async (req, res) => {
  const { blocker_id, blocked_id } = req.body;

  try {
    let friendship = await Friendship.findOne({
      $or: [
        { sender_id: blocker_id, receiver_id: blocked_id },
        { sender_id: blocked_id, receiver_id: blocker_id },
      ],
    });

    if (friendship) {
      friendship.status = "blocked";
      await friendship.save();
    } else {
      // Nếu chưa có quan hệ trước đó, tạo mới với trạng thái "blocked"
      friendship = await Friendship.create({
        sender_id: blocker_id,
        receiver_id: blocked_id,
        status: "blocked",
      });
    }

    res.json({ status: "ok", message: "Người dùng đã bị chặn", friendship });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Hủy kết bạn (Đã chấp nhận lời mời kết bạn)
router.post("/unfriend", async (req, res) => {
  const { user_id, friend_id } = req.body;

  try {
    const friendship = await Friendship.findOneAndDelete({
      $or: [
        { sender_id: user_id, receiver_id: friend_id, status: "accepted" },
        { sender_id: friend_id, receiver_id: user_id, status: "accepted" },
      ],
    });

    if (!friendship) {
      return res
        .status(400)
        .json({ status: "error", message: "Không tìm thấy bạn bè để hủy" });
    }

    res.json({ status: "ok", message: "Đã hủy kết bạn thành công" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Xem danh sách bạn bè
router.get("/friends/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const friendships = await Friendship.find({
      $or: [
        { sender_id: user_id, status: "accepted" },
        { receiver_id: user_id, status: "accepted" },
      ],
    });

    const friendIds = friendships.map((friendship) =>
      friendship.sender_id.toString() === user_id
        ? friendship.receiver_id
        : friendship.sender_id
    );

    const friends = await User.find({ _id: { $in: friendIds } });

    res.json({ status: "ok", friends });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Gợi ý kết bạn (Dựa trên bạn chung)
router.get("/friend-suggestions/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    // Lấy danh sách bạn bè của user hiện tại
    const friendships = await Friendship.find({
      $or: [
        { sender_id: user_id, status: "accepted" },
        { receiver_id: user_id, status: "accepted" },
      ],
    });

    const friendIds = friendships.map((friendship) =>
      friendship.sender_id.toString() === user_id
        ? friendship.receiver_id
        : friendship.sender_id
    );

    // Tìm bạn của bạn (friend of friend) nhưng chưa kết bạn với user hiện tại
    const suggestedFriends = await Friendship.find({
      $or: [
        { sender_id: { $in: friendIds }, status: "accepted" },
        { receiver_id: { $in: friendIds }, status: "accepted" },
      ],
      sender_id: { $ne: user_id },
      receiver_id: { $ne: user_id },
    });

    const suggestedFriendIds = suggestedFriends
      .map((f) =>
        friendIds.includes(f.sender_id.toString()) ? f.receiver_id : f.sender_id
      )
      .filter(
        (id) => !friendIds.includes(id.toString()) && id.toString() !== user_id
      );

    const uniqueSuggestedFriendIds = [...new Set(suggestedFriendIds)]; // Loại bỏ trùng lặp

    // Lấy thông tin của những người được gợi ý
    const users = await User.find({ _id: { $in: uniqueSuggestedFriendIds } });

    res.json({ status: "ok", suggestions: users });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Đếm số lượng bạn chung giữa 2 user
router.get("/mutual-friends/:user1_id/:user2_id", async (req, res) => {
  const { user1_id, user2_id } = req.params;

  try {
    // Lấy danh sách bạn bè của user1
    const friendships1 = await Friendship.find({
      $or: [
        { sender_id: user1_id, status: "accepted" },
        { receiver_id: user1_id, status: "accepted" },
      ],
    });

    const friendIds1 = friendships1.map((f) =>
      f.sender_id.toString() === user1_id ? f.receiver_id : f.sender_id
    );

    // Lấy danh sách bạn bè của user2
    const friendships2 = await Friendship.find({
      $or: [
        { sender_id: user2_id, status: "accepted" },
        { receiver_id: user2_id, status: "accepted" },
      ],
    });

    const friendIds2 = friendships2.map((f) =>
      f.sender_id.toString() === user2_id ? f.receiver_id : f.sender_id
    );

    // Tìm bạn chung giữa user1 và user2
    const mutualFriends = friendIds1.filter((id) =>
      friendIds2.includes(id.toString())
    );

    res.json({
      status: "ok",
      mutualFriendsCount: mutualFriends.length,
      mutualFriends,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Cập nhật tất cả tin nhắn "sent" và "received" thành "viewed" khi user mở cuộc trò chuyện
router.put("/messages/viewed", async (req, res) => {
  try {
    const { receiverId, senderId } = req.body;

    if (!receiverId || !senderId) {
      return res.status(400).json({ error: "Thiếu receiverId hoặc senderId" });
    }

    // console.log("Dữ liệu nhận được:", { receiverId, senderId });

    // Cập nhật tất cả tin nhắn chưa đọc giữa hai người
    const result = await Messages.updateMany(
      {
        sender_id: senderId,
        receiver_id: receiverId,
        status: { $in: ["sent", "received"] },
      },
      { $set: { status: "viewed" } }
    );

    // console.log("Kết quả cập nhật:", result);

    return res.status(200).json({
      message:
        result.modifiedCount > 0
          ? "Tất cả tin nhắn chưa đọc đã được đánh dấu là đã xem"
          : "Không có tin nhắn nào cần cập nhật",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái tin nhắn:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật trạng thái tin nhắn" });
  }
});

module.exports = router;
