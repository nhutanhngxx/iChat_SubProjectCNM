const User = require("../schemas/UserDetails");
const Friendship = require("../schemas/Friendship");

require("dotenv").config();

const FriendshipController = {
  // Gửi lời mời kết bạn
  sendFriendRequest: async (req, res) => {
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
          return res.status(400).json({
            status: "error",
            message: "Lời mời kết bạn đang chờ duyệt",
          });
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
  },
  // Chấp nhận lời mời kết bạn
  acceptFriendRequest: async (req, res) => {
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
  },

  rejectFriendRequest: async (req, res) => {},

  //   Hủy lời mời kết bạn
  cancelFriendRequest: async (req, res) => {
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
  },

  // Chặn người dùng
  blockUser: async (req, res) => {
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
  },

  // Hủy kết bạn (Đã chấp nhận lời mời kết bạn)
  unfriendUser: async (req, res) => {
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
  },

  // Lấy danh sách bạn bè của người dùng
  getUserFriends: async (req, res) => {
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
  },

  // Gợi ý bạn bè dựa trên bạn chung
  getListFriendsSugestion: async (req, res) => {
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
          friendIds.includes(f.sender_id.toString())
            ? f.receiver_id
            : f.sender_id
        )
        .filter(
          (id) =>
            !friendIds.includes(id.toString()) && id.toString() !== user_id
        );

      const uniqueSuggestedFriendIds = [...new Set(suggestedFriendIds)]; // Loại bỏ trùng lặp

      // Lấy thông tin của những người được gợi ý
      const users = await User.find({ _id: { $in: uniqueSuggestedFriendIds } });

      res.json({ status: "ok", suggestions: users });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  // Đếm số lượng bạn chung giữa 2 người dùng
  countMutalFriends: async (req, res) => {
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
  },
};

module.exports = FriendshipController;
