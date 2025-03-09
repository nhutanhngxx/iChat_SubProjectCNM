const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserDetails");
const Friendship = require("../models/Friendship");
require("dotenv").config(); // Đọc JWT_SECRET từ .env
const cookieParser = require("cookie-parser");
router.use(cookieParser());

// Đăng ký tài khoản
router.post("/register", async (req, res) => {
  const {
    full_name,
    gender,
    dob,
    phone,
    password,
    avatar_path,
    cover_path,
    status,
  } = req.body;

  try {
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
      // const token = jwt.sign({ phone: user.phone }, process.env.JWT_SECRET, {
      //   expiresIn: "1h",
      // });
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

// Hủy lời mời kết bạn
router.post("/cancel-friend-request", async (req, res) => {
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

module.exports = router;
