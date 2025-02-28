const express = require("express");
const router = express.Router();
const Messages = require("../Schema/Messages");
const MessageCard = require("../Schema/MessageCard");

// Gửi tin nhắn
router.post("/send-message", async (req, res) => {
  try {
    const newMessage = new Messages(req.body);
    await newMessage.save();

    // Tự động tạo MessageCard với trạng thái unread
    const messageCard = new MessageCard({
      receiver_id: newMessage.receiver_id,
      message_id: newMessage._id,
      status: "unread",
      card_color: "#FF0000", // Màu đỏ cho tin nhắn chưa đọc
      title: "New Message",
    });
    await messageCard.save();

    res
      .status(201)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Lấy danh sách các tin nhắn liên quan đến người dùng
router.get("/messages/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Messages.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }],
    }).sort({ createdAt: 1 }); // Sắp xếp theo thời gian tăng dần

    res.json({ status: "ok", data: messages });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Lấy tin nhắn theo Người đăng nhập và các người dùng khác
router.get("/messages/:userId/:receiverId", async (req, res) => {
  try {
    const { userId, receiverId } = req.params;

    const messages = await Messages.find({
      $or: [
        { sender_id: userId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: userId },
      ],
    }).sort({ createdAt: 1 }); // Sắp xếp tin nhắn theo thời gian tăng dần

    res.json({ status: "ok", data: messages });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Xóa tất cả tin nhắn giữa người dùng đăng nhập và người nhận
router.delete("/messages/:userId/:receiverId", async (req, res) => {
  try {
    const { userId, receiverId } = req.params;

    // Xóa tất cả tin nhắn có sender và receiver tương ứng
    await Messages.deleteMany({
      $or: [
        { sender_id: userId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: userId },
      ],
    });

    res.json({ status: "ok", message: "Deleted all messages successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Xóa tin nhắn theo ID của tin nhắn
router.delete("/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;

    // Kiểm tra tin nhắn có tồn tại không
    const message = await Messages.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Xóa tin nhắn
    await Messages.findByIdAndDelete(messageId);

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Thêm reactions cho tin nhắn
router.post("/:messageId/reactions", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { user_id, reaction_type } = req.body;

    // Kiểm tra các trường đầu vào
    if (!user_id || !reaction_type) {
      return res
        .status(400)
        .json({ error: "Missing user_id or reaction_type" });
    }

    // Kiểm tra tin nhắn có tồn tại không
    const message = await Messages.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Kiểm tra reaction_type hợp lệ
    const validReactions = ["like", "love", "haha", "wow", "sad", "angry"];
    if (!validReactions.includes(reaction_type)) {
      return res.status(400).json({ error: "Invalid reaction type" });
    }

    // Kiểm tra xem user đã thả reaction vào tin nhắn chưa
    const existingReaction = message.reactions.find(
      (r) => r.user_id.toString() === user_id
    );

    if (existingReaction) {
      // Nếu đã tồn tại reaction -> Cập nhật loại reaction
      existingReaction.reaction_type = reaction_type;
    } else {
      // Nếu chưa có reaction -> Thêm mới vào mảng
      message.reactions.push({ user_id, reaction_type });
    }

    // Lưu cập nhật vào database
    await message.save();

    res.json({
      message: "Reaction added successfully",
      updatedMessage: message,
    });
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Xóa reactions
router.delete("/:messageId/reactions/:userId", async (req, res) => {
  try {
    const { messageId, userId } = req.params;

    const message = await Messages.findByIdAndUpdate(
      messageId,
      { $pull: { reactions: { user_id: userId } } },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({
      message: "Reaction removed successfully",
      updatedMessage: message,
    });
  } catch (error) {
    console.error("Error removing reaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Ghim hoặc bỏ ghim tin nhắn
router.patch("/:messageId/pin", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { is_pinned } = req.body; // true hoặc false

    // Kiểm tra tin nhắn có tồn tại không
    const message = await Messages.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Cập nhật trạng thái ghim
    message.is_pinned = is_pinned;
    await message.save();

    res.json({
      message: "Message pin status updated successfully",
      updatedMessage: message,
    });
  } catch (error) {
    console.error("Error updating pin status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Danh sách tin nhắn đã ghim
const mongoose = require("mongoose");

router.get("/messages/pinned/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;

    // Kiểm tra chatId có phải ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    // Lấy tin nhắn đã ghim trong chat
    const pinnedMessages = await Messages.find({
      receiver_id: new mongoose.Types.ObjectId(chatId),
      is_pinned: true,
    });

    res.json({ pinnedMessages });
  } catch (error) {
    console.error("Error fetching pinned messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Trả lời tin nhắn
router.post("/messages/reply", async (req, res) => {
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
});

module.exports = router;
