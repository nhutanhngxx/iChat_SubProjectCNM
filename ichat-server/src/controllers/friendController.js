const User = require("../schemas/UserDetails");
const Friendship = require("../schemas/Friendship");

require("dotenv").config();

const FriendshipController = {
  // Kiểm tra trạng thái chặn giữa hai người dùng
  checkBlockingStatus: async (req, res) => {
    const { userId, otherUserId } = req.params;

    try {
      // Kiểm tra nếu userId hoặc otherUserId bị thiếu
      if (!userId || !otherUserId) {
        return res.status(400).json({
          status: "error",
          message: "Cần cung cấp cả userId và otherUserId",
        });
      }

      // Kiểm tra nếu userId và otherUserId giống nhau
      if (userId === otherUserId) {
        return res.status(400).json({
          status: "error",
          message: "Không thể kiểm tra trạng thái chặn với chính mình",
        });
      }

      // Truy vấn mối quan hệ có trạng thái "blocked" giữa hai người dùng
      const friendship = await Friendship.findOne({
        $or: [
          { sender_id: userId, receiver_id: otherUserId, status: "blocked" },
          { sender_id: otherUserId, receiver_id: userId, status: "blocked" },
        ],
      }).populate("blocked_by", "full_name"); // Điền thông tin người chặn

      if (!friendship) {
        return res.json({
          status: "ok",
          message: "Không có trạng thái chặn giữa hai người dùng",
          data: { isBlocking: false, isBlocked: false },
        });
      }

      // Xác định trạng thái chặn
      const isBlocking = friendship.blocked_by._id.toString() === userId;
      const isBlocked = friendship.blocked_by._id.toString() === otherUserId;

      let message = "";
      if (isBlocking) {
        message = `Người dùng ${userId} đang chặn người dùng ${otherUserId}`;
      } else if (isBlocked) {
        message = `Người dùng ${userId} đang bị người dùng ${otherUserId} chặn`;
      }

      return res.json({
        status: "ok",
        message,
        data: {
          isBlocking,
          isBlocked,
          blockedBy: friendship.blocked_by,
        },
      });
    } catch (error) {
      console.error("Error in checkBlockingStatus:", error);
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },

  // Kiểm tra trạng thái kết bạn giữa 2 người dùng
  checkFriendStatus: async (req, res) => {
    const { user_id, friend_id } = req.body;
    try {
      console.log("User ID: ", user_id);
      console.log("Friend ID: ", friend_id);

      const friendship = await Friendship.findOne({
        $or: [
          { sender_id: user_id, receiver_id: friend_id },
          { sender_id: friend_id, receiver_id: user_id },
        ],
      });

      if (!friendship) {
        return res.status(200).json({
          status: "ok",
          message: "Không tìm thấy kết nối",
        });
      }

      res.json({ status: "ok", friendship });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  // Láy danh sách người dùng đã bị chặn
  getBlockedUsers: async (req, res) => {
    const { userId } = req.params;
    try {
      const blockedFriendships = await Friendship.find({
        blocked_by: userId,
        status: "blocked",
      });

      const blockedUsersIds = blockedFriendships.map((friendship) => {
        const isSenderBlocker =
          friendship.blocked_by.toString() ===
          friendship.sender_id._id.toString();
        return isSenderBlocker ? friendship.receiver_id : friendship.sender_id;
      });

      const blockedUsers = await User.find({
        _id: { $in: blockedUsersIds },
      });

      res.json({ status: "ok", data: blockedUsers });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  // Lấy danh sách bạn bè của người dùng
  getFriendListByUserId: async (req, res) => {
    const { userId } = req.params;

    try {
      const friendships = await Friendship.find({
        $or: [
          { sender_id: userId, status: "accepted" },
          { receiver_id: userId, status: "accepted" },
        ],
      });

      const friendIds = friendships.map((friendship) =>
        friendship.sender_id.toString() === userId
          ? friendship.receiver_id
          : friendship.sender_id
      );

      const friends = await User.find({ _id: { $in: friendIds } });

      res.json({ status: "ok", friends });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  // Lấy danh sách lời mời kết bạn đã gửi
  sentFriendRequests: async (req, res) => {
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
      res.json({
        status: "ok",
        friendRequests: friendRequestsWithReceiverInfo,
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  // Lấy danh sách lời mời kết bạn đã nhận
  receivedFriendRequests: async (req, res) => {
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
  },

  // Gửi lời mời kết bạn
  sendFriendRequest: async (req, res) => {
    const { senderId, receiverId } = req.body;

    try {
      // Kiểm tra nếu sender_id và receiver_id giống nhau
      if (senderId === receiverId) {
        return res.status(400).json({
          status: "error",
          message: "Không thể gửi lời mời kết bạn cho chính mình",
        });
      }

      // Kiểm tra nếu đã có mối quan hệ trước đó
      const existingFriendship = await Friendship.findOne({
        $or: [
          { sender_id: senderId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: senderId },
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
        sender_id: senderId,
        receiver_id: receiverId,
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
    const { senderId, receiverId } = req.body;

    try {
      const friendship = await Friendship.findOne({
        sender_id: senderId,
        receiver_id: receiverId,
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

  //  Từ chối / Hủy lời mời kết bạn
  cancelFriendRequest: async (req, res) => {
    const { senderId, receiverId } = req.body;
    console.log("Sender ID: ", senderId);
    console.log("Receiver ID: ", receiverId);

    try {
      const friendship = await Friendship.findOneAndDelete({
        sender_id: senderId,
        receiver_id: receiverId,
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

  // Kiểm tra trạng thái kết bạn giữa 2 người dùng
  checkFriendStatus: async (req, res) => {
    const { user_id, friend_id } = req.body;
    try {
      console.log("User ID: ", user_id);
      console.log("Friend ID: ", friend_id);

      const friendship = await Friendship.findOne({
        $or: [
          { sender_id: user_id, receiver_id: friend_id },
          { sender_id: friend_id, receiver_id: user_id },
        ],
      });

      if (!friendship) {
        return res.status(200).json({
          status: "ok",
          message: "Không tìm thấy kết nối",
        });
      }

      res.json({ status: "ok", friendship });
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

      if (!friendship) {
        // Nếu chưa có quan hệ trước đó, tạo mới với trạng thái "blocked"
        friendship = await Friendship.create({
          sender_id: blocker_id,
          receiver_id: blocked_id,
          blocked_by: blocker_id,
          status: "blocked",
        });
        return res.json({
          status: "ok",
          message: "Chặn người dùng thành công!",
          friendship,
        });
      }

      if (!friendship.blocked_by) {
        friendship.status = "blocked";
        friendship.blocked_by = blocker_id; // Lưu người chặn
        await friendship.save();
        return res.json({
          status: "ok",
          message: "Chặn người dùng thành công!",
          friendship,
        });
      }

      // Nếu đã bị chặn trước đó thì thông báo đã bị chặn
      return res.json({
        status: "error",
        message:
          "Bạn đã bị người dùng này chặn trước đó. Không thể thực hiện thao tác này.",
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  // Hủy chặn người dùng - Tìm và xóa friendship với trạng thái "blocked"
  unblockUser: async (req, res) => {
    const { blocker_id, blocked_id } = req.body;

    try {
      const friendship = await Friendship.findOneAndDelete({
        $or: [
          {
            blocked_by: blocker_id,
            receiver_id: blocked_id,
            status: "blocked",
          },
          { blocked_by: blocker_id, sender_id: blocked_id, status: "blocked" },
        ],
      });

      if (!friendship) {
        return res.status(400).json({
          status: "error",
          message: "Không tìm thấy người dùng để hủy chặn",
        });
      }

      res.json({ status: "ok", message: "Đã hủy chặn thành công" });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  // Kiểm tra trạng thái chặn giữa 2 người dùng
  checkBlockStatus: async (req, res) => {
    const { user_id, target_id } = req.params;

    try {
      // Kiểm tra xem user_id có bị chặn bởi target_id không
      const blockedByTarget = await Friendship.findOne({
        $or: [
          {
            sender_id: user_id,
            receiver_id: target_id,
            status: "blocked",
            blocked_by: target_id,
          },
          {
            sender_id: target_id,
            receiver_id: user_id,
            status: "blocked",
            blocked_by: target_id,
          },
        ],
      });

      // Kiểm tra xem user_id có chặn target_id không
      const blockedByUser = await Friendship.findOne({
        $or: [
          {
            sender_id: user_id,
            receiver_id: target_id,
            status: "blocked",
            blocked_by: user_id,
          },
          {
            sender_id: target_id,
            receiver_id: user_id,
            status: "blocked",
            blocked_by: user_id,
          },
        ],
      });

      res.json({
        status: "ok",
        isBlocked: !!blockedByTarget || !!blockedByUser,
        blockedByTarget: !!blockedByTarget,
        blockedByUser: !!blockedByUser,
      });
    } catch (error) {
      console.error("Error checking block status:", error);
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
