const Messages = require("../schemas/Messages");
const MessageCard = require("../schemas/MessageCard");
const GroupChat = require("../schemas/GroupChat");
const GroupMembers = require("../schemas/GroupMember");
const Users = require("../schemas/UserDetails");
const mongoose = require("mongoose");

const MessageModel = require("../models/messageModel");

const MessageController = {
  uploadImage: async (req, res) => {
    try {
      const result = await MessageModel.uploadImage({
        sender_id: req.body.sender_id,
        receiver_id: req.body.receiver_id,
        chat_type: req.body.chat_type,
        file: req.file,
      });

      res.status(201).json({
        message: "Image message sent successfully",
        data: result,
      });
    } catch (err) {
      res
        .status(err.status || 500)
        .json({ error: err.message || "Internal server error" });
    }
  },

  sendMessage: async (req, res) => {
    try {
      const imageFile = req.files?.image?.[0] || null;
      const docFile = req.files?.file?.[0] || null;
      const result = await MessageModel.sendMessage({
        sender_id: req.body.sender_id,
        receiver_id: req.body.receiver_id,
        content: req.body.content,
        type: req.body.type,
        chat_type: req.body.chat_type,
        file: imageFile || docFile,
      });

      res.status(201).json({
        message: "Message sent successfully",
        data: result,
      });
    } catch (err) {
      res
        .status(err.status || 500)
        .json({ error: err.message || "Internal server error" });
    }
  },

  sendGroupMessage: async (req, res) => {
    try {
      const result = await MessageModel.sendGroupMessage(req.body);
      res.status(201).json({
        message: "Group message sent successfully",
        data: result,
      });
    } catch (err) {
      res
        .status(err.status || 500)
        .json({ error: err.message || "Internal server error" });
    }
  },

  getUserMessages: async (req, res) => {
    try {
      const result = await MessageModel.getUserMessages(req.params.userId);
      res.json({ status: "ok", data: result });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },

  getPrivateMessages: async (req, res) => {
    try {
      const result = await MessageModel.getPrivateMessages(
        req.params.userId,
        req.params.receiverId
      );
      res.json({ status: "ok", data: result });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },

  deleteAllMessages: async (req, res) => {
    try {
      await MessageModel.deleteAllMessages(
        req.params.userId,
        req.params.receiverId
      );
      res.json({ status: "ok", message: "Deleted all messages successfully" });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },

  recallToMessage: async (req, res) => {
    try {
      const updated = await MessageModel.recallMessage(req.params.messageId);
      res.json({ status: "ok", message: "Message recalled successfully" });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  addReactionToMessage: async (req, res) => {
    try {
      const result = await MessageModel.addReaction({
        messageId: req.params.messageId,
        user_id: req.body.user_id,
        reaction_type: req.body.reaction_type,
      });

      res.json({
        message: "Reaction added successfully",
        updatedMessage: result,
      });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  removeReactionToMessage: async (req, res) => {
    try {
      const result = await MessageModel.removeReaction(
        req.params.messageId,
        req.params.userId
      );
      res.json({
        message: "Reaction removed successfully",
        updatedMessage: result,
      });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  pinMessage: async (req, res) => {
    try {
      const result = await MessageModel.pinMessage(
        req.params.messageId,
        req.body.is_pinned
      );
      res.json({
        message: "Message pin status updated successfully",
        updatedMessage: result,
      });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  getPinnedMessages: async (req, res) => {
    try {
      const result = await MessageModel.getPinnedMessages(req.params.chatId);
      res.json({ pinnedMessages: result });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  recentReceivers: async (req, res) => {
    try {
      const senderId = req.params.senderId;

      const recentReceivers = await Messages.aggregate([
        {
          $match: {
            $or: [
              { sender_id: new mongoose.Types.ObjectId(senderId) },
              { receiver_id: new mongoose.Types.ObjectId(senderId) },
            ],
          }, // Lọc tin nhắn mà người dùng là người gửi hoặc người nhận
        },
        {
          $sort: { timestamp: -1 }, // Sắp xếp theo thời gian gần nhất
        },
        {
          $group: {
            _id: {
              // Nhóm theo cặp người gửi và người nhận
              $cond: [
                { $eq: ["$sender_id", new mongoose.Types.ObjectId(senderId)] },
                // Nếu người dùng hiện tại là người gửi, thì nhóm theo receiver_id
                "$receiver_id",
                // Ngược lại nhóm theo sender_id (vì người dùng là receiver)
                "$sender_id",
              ],
            },
            lastMessage: { $first: "$content" }, // Lấy nội dung tin nhắn gần nhất
            timestamp: { $first: "$timestamp" }, // Lấy thời gian tin nhắn gần nhất
            status: { $first: "$status" }, // Trạng thái tin nhắn gần nhất
            type: { $first: "$type" }, // Loại tin nhắn
            // Thêm trường để xác định ai là người gửi tin nhắn cuối
            lastMessageSender: { $first: "$sender_id" },
          },
        },
        {
          $lookup: {
            from: "UserInfo", // Bảng UserInfo
            localField: "_id",
            foreignField: "_id",
            as: "receiverInfo",
          },
        },
        {
          $unwind: "$receiverInfo", // Giải nén thông tin người nhận
        },
        {
          $lookup: {
            from: "Message", // Lấy tin nhắn chưa đọc
            let: {
              receiverId: "$_id",
              senderId: new mongoose.Types.ObjectId(senderId),
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: [
                          "$receiver_id",
                          new mongoose.Types.ObjectId(senderId),
                        ],
                      }, // Chỉ lấy tin nhắn gửi đến người dùng hiện tại
                      { $eq: ["$sender_id", "$$receiverId"] }, // Từ người đang chat với
                      { $ne: ["$status", "Viewed"] }, // Chưa đọc
                    ],
                  },
                },
              },
              {
                $count: "unread", // Đếm số lượng tin nhắn chưa đọc
              },
            ],
            as: "unreadMessages",
          },
        },
        {
          $addFields: {
            unread: {
              $ifNull: [{ $arrayElemAt: ["$unreadMessages.unread", 0] }, 0],
            }, // Nếu không có thì mặc định là 0
            // Thêm trường xác định tin nhắn cuối cùng là từ mình hay người khác
            isLastMessageFromMe: {
              $eq: [
                "$lastMessageSender",
                new mongoose.Types.ObjectId(senderId),
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            receiver_id: "$receiverInfo._id",
            name: "$receiverInfo.full_name",
            avatar_path: "$receiverInfo.avatar_path",
            lastMessage: 1,
            timestamp: 1,
            status: 1,
            user_status: "$receiverInfo.status", // Trạng thái online/offline của người nhận
            type: 1,
            unread: 1, // Số lượng tin nhắn chưa đọc
            isLastMessageFromMe: 1, // Tin nhắn cuối cùng có phải từ mình không
          },
        },
      ]);

      res.status(200).json({ success: true, data: recentReceivers });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  replyToMessage: async (req, res) => {
    try {
      const { sender_id, receiver_id, content, type, chat_type, reply_to } =
        req.body;

      // Kiểm tra xem tin nhắn gốc có tồn tại không (nếu có trả lời)
      if (reply_to) {
        const originalMessage = await Messages.findById(reply_to);
        if (!originalMessage) {
          return res.status(404).json({ error: "Original message not found" });
        }
      }

      const newMessage = new Messages({
        sender_id,
        receiver_id,
        content,
        type,
        chat_type,
        reply_to: reply_to || null,
      });

      await newMessage.save();
      res.status(201).json({ message: "Reply sent successfully", newMessage });
    } catch (error) {
      console.error("Error sending reply:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  searchMessages: async (req, res) => {
    try {
      const { search } = req.query;
      const { userId } = req.params;

      if (!search) {
        return res
          .status(400)
          .json({ status: "error", message: "Từ khóa tìm kiếm là bắt buộc" });
      }

      // Tìm kiếm tin nhắn
      const messages = await MessageModel.searchMessages(search, userId);

      // Trả về kết quả
      if (!messages.length) {
        return res.json({
          status: "ok",
          messages: [],
          message: "Không tìm thấy tin nhắn nào",
        });
      }

      res.json({
        status: "ok",
        messages,
      });
    } catch (error) {
      console.error("Lỗi khi tìm kiếm tin nhắn:", error);
      res.status(error.status || 500).json({
        status: "error",
        message: error.message || "Lỗi server khi tìm kiếm tin nhắn",
      });
    }
  },

  getUserMessagesCards: async (req, res) => {
    try {
      const { userId } = req.params;

      const messageCards = await MessageCard.find({ own_id: userId }).sort({
        createdAt: -1,
      });

      res.json({ status: "ok", data: messageCards });
    } catch (error) {
      console.error("Error fetching message cards:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  // Tạo MessageCard
  createMessageCard: async (req, res) => {
    try {
      const { own_id, title, card_color } = req.body;
      const newMessageCard = new MessageCard({ own_id, title, card_color });

      await newMessageCard.save();
      res.status(201).json({ status: "ok", data: newMessageCard });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  // Cập nhật tất cả tin nhắn "sent" và "received" thành "viewed" khi user mở cuộc trò chuyện
  updateMessagesViewedStatus: async (req, res) => {
    try {
      const { receiverId, senderId } = req.body;

      if (!receiverId || !senderId) {
        return res
          .status(400)
          .json({ error: "Thiếu receiverId hoặc senderId" });
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
  },
};

module.exports = MessageController;
