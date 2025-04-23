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
        reply_to: req.body.reply_to || null,
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
      const videoFile = req.files?.video?.[0] || null;
      const docFile = req.files?.file?.[0] || null;
      const audioFile = req.files?.audio?.[0] || null;
      const file = videoFile || imageFile || docFile || audioFile;

      // Nếu là audio, thêm duration vào payload
      const additionalData = {};
      if (req.body.type === "audio" && req.body.duration) {
        additionalData.duration = parseInt(req.body.duration, 10);
      }

      const result = await MessageModel.sendMessage({
        sender_id: req.body.sender_id,
        receiver_id: req.body.receiver_id,
        content: req.body.content || "",
        type: req.body.type,
        chat_type: req.body.chat_type,
        file: file,
        reply_to: req.body.reply_to || null,
        ...additionalData,
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

  // Xử lý gửi nhiều ảnh
  sendMultipleImages: async (req, res) => {
    try {
      const { sender_id, receiver_id, chat_type } = req.body;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "No images provided",
        });
      }

      const messages = await MessageModel.sendMultipleImages({
        files,
        sender_id,
        receiver_id,
        chat_type,
      });

      res.status(201).json({
        status: "ok",
        data: messages,
      });
    } catch (error) {
      console.error("Error in sendMultipleImages controller:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Internal server error",
      });
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
      res.json({ status: "ok", message: "Xóa cuộc trò chuyện thành công." });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },

  recallToMessage: async (req, res) => {
    try {
      // Lấy userId từ request body hoặc params
      const userId = req.body.userId || req.params.userId; // Thay đổi ở đây
      // Truyền cả messageId và userId vào MessageModel.recallMessage
      const updated = await MessageModel.recallMessage(
        req.params.messageId,
        userId
      );
      res.json({
        status: "ok",
        message: "Thu hồi tin nhắn thành công rồi nhé!",
        data: updated,
      });
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
        message: "Update reaction cho tin nhắn thành công!",
        updatedMessage: result,
      });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  removeReactionToMessage: async (req, res) => {
    try {
      const { messageId, userId } = req.params;
      const { reaction_type } = req.body;
      console.log(
        "messageId, userId, reaction_type",
        messageId,
        userId,
        reaction_type
      );
      const result = await MessageModel.removeReaction({
        messageId,
        userId,
        reaction_type,
      });
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
      const senderObjectId = new mongoose.Types.ObjectId(senderId);

      // PHẦN 1: LẤY TIN NHẮN PRIVATE GẦN NHẤT
      const recentPrivateReceivers = await Messages.aggregate([
        {
          $match: {
            $or: [
              { sender_id: senderObjectId },
              { receiver_id: senderObjectId },
            ],
            chat_type: "private", // Chỉ lấy tin nhắn private
            isdelete: { $not: { $elemMatch: { $eq: senderObjectId } } },
          },
        },
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: {
              $cond: [
                { $lt: ["$sender_id", "$receiver_id"] },
                { sender: "$sender_id", receiver: "$receiver_id" },
                { sender: "$receiver_id", receiver: "$sender_id" },
              ],
            },
            lastMessage: { $first: "$content" },
            timestamp: { $first: "$timestamp" },
            status: { $first: "$status" },
            type: { $first: "$type" },
            lastMessageSender: { $first: "$sender_id" },
            chat_type: { $first: "$chat_type" },
          },
        },
        {
          $match: {
            $or: [
              { "_id.sender": senderObjectId },
              { "_id.receiver": senderObjectId },
            ],
          },
        },
        {
          $addFields: {
            otherUserId: {
              $cond: [
                { $eq: ["$_id.sender", senderObjectId] },
                "$_id.receiver",
                "$_id.sender",
              ],
            },
          },
        },
        {
          $lookup: {
            from: "UserInfo",
            localField: "otherUserId",
            foreignField: "_id",
            as: "receiverInfo",
          },
        },
        { $unwind: "$receiverInfo" },
        {
          $lookup: {
            from: "Message",
            let: {
              otherId: "$otherUserId",
              me: senderObjectId,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$receiver_id", "$$me"] },
                      { $eq: ["$sender_id", "$$otherId"] },
                      { $ne: ["$status", "Viewed"] },
                      { $not: [{ $in: ["$$me", "$isdelete"] }] },
                    ],
                  },
                },
              },
              { $count: "unread" },
            ],
            as: "unreadMessages",
          },
        },
        {
          $addFields: {
            unread: {
              $ifNull: [{ $arrayElemAt: ["$unreadMessages.unread", 0] }, 0],
            },
            isLastMessageFromMe: {
              $eq: ["$lastMessageSender", senderObjectId],
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
            user_status: "$receiverInfo.status",
            type: 1,
            unread: 1,
            isLastMessageFromMe: 1,
            chat_type: 1,
          },
        },
      ]);

      // PHẦN 2: LẤY TIN NHẮN NHÓM GẦN NHẤT
      // 1. Tìm tất cả nhóm mà người dùng là thành viên
      const userGroups = await GroupMembers.find({
        user_id: senderObjectId,
      }).distinct("group_id");

      const groupObjectIds = userGroups.map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      // 2. Lấy tin nhắn gần nhất của mỗi nhóm
      const recentGroupMessages = await Messages.aggregate([
        {
          $match: {
            chat_type: "group",
            receiver_id: { $in: groupObjectIds },
            isdelete: { $not: { $elemMatch: { $eq: senderObjectId } } },
          },
        },
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: "$receiver_id", // Group by group_id (stored in receiver_id for group messages)
            lastMessage: { $first: "$content" },
            timestamp: { $first: "$timestamp" },
            status: { $first: "$status" },
            type: { $first: "$type" },
            lastMessageSender: { $first: "$sender_id" },
            chat_type: { $first: "$chat_type" },
          },
        },
        // Lấy thông tin của nhóm
        {
          $lookup: {
            from: "GroupChat",
            localField: "_id",
            foreignField: "_id",
            as: "groupInfo",
          },
        },
        { $unwind: "$groupInfo" },
        // Đếm tin nhắn chưa đọc trong nhóm
        {
          $lookup: {
            from: "Message",
            let: {
              groupId: "$_id",
              me: senderObjectId,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$chat_type", "group"] },
                      { $eq: ["$receiver_id", "$$groupId"] },
                      { $ne: ["$sender_id", "$$me"] }, // Không đếm tin nhắn của chính người dùng
                      { $ne: ["$status", "Viewed"] },
                      { $not: [{ $in: ["$$me", "$isdelete"] }] },
                    ],
                  },
                },
              },
              { $count: "unread" },
            ],
            as: "unreadMessages",
          },
        },
        {
          $addFields: {
            unread: {
              $ifNull: [{ $arrayElemAt: ["$unreadMessages.unread", 0] }, 0],
            },
            isLastMessageFromMe: {
              $eq: ["$lastMessageSender", senderObjectId],
            },
          },
        },
        {
          $project: {
            _id: 0,
            receiver_id: "$_id",
            name: "$groupInfo.name",
            avatar_path: "$groupInfo.avatar",
            lastMessage: 1,
            timestamp: 1,
            status: 1,
            user_status: "online", // Nhóm luôn "online"
            type: 1,
            unread: 1,
            isLastMessageFromMe: 1,
            chat_type: 1,
          },
        },
      ]);

      // PHẦN 3: KẾT HỢP CẢ HAI VÀ SẮP XẾP
      const allRecentMessages = [
        ...recentPrivateReceivers,
        ...recentGroupMessages,
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      res.status(200).json({ success: true, data: allRecentMessages });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tin nhắn gần đây:", error);
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

  // Chuyển tiếp tin nhắn
  forwardMessage: async (req, res) => {
    try {
      const { messageId, receiverId, currentUserId } = req.body;

      if (!messageId || !receiverId || !currentUserId) {
        return res
          .status(400)
          .json({ error: "Thiếu messageId, receiverId hoặc currentUserId" });
      }

      // Không cho phép gửi cho chính mình
      if (currentUserId.toString() === receiverId.toString()) {
        return res
          .status(400)
          .json({ error: "Không thể chuyển tiếp tin nhắn cho chính mình" });
      }

      // Tìm tin nhắn gốc
      const originalMessage = await Messages.findById(messageId);

      if (!originalMessage) {
        return res.status(404).json({ error: "Tin nhắn không tồn tại" });
      }

      // Tạo tin nhắn mới
      const newMessage = new Messages({
        sender_id: currentUserId, // Người đang đăng nhập là người gửi mới
        receiver_id: receiverId,
        content: originalMessage.content,
        type: originalMessage.type,
        chat_type: originalMessage.chat_type,
        status: "sent",
      });

      await newMessage.save();

      res.status(201).json({
        message: "Tin nhắn đã được chuyển tiếp thành công",
        data: newMessage,
      });
    } catch (error) {
      console.error("Lỗi khi chuyển tiếp tin nhắn:", error);
      res.status(500).json({ error: "Lỗi khi chuyển tiếp tin nhắn" });
    }
  },

  // Soft delete (ẩn tin nhắn khỏi user hiện tại)
  softDeleteMessagesForUser: async (req, res) => {
    const { userId, messageId } = req.body;

    try {
      const updatedMessages = await MessageModel.softDeleteMessagesForUser(
        userId,
        messageId
      );
      res.status(200).json({
        message: "Messages hidden for user.",
        data: updatedMessages, //
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to soft delete messages." });
    }
  },
};

module.exports = MessageController;
