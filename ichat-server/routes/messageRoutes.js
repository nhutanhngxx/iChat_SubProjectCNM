const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Messages = require("../models/Messages");
const MessageCard = require("../models/MessageCard");
const GroupChat = require("../models/GroupChat");
const GroupMembers = require("../models/GroupMember");
const multer = require("multer");

const { uploadFile } = require("../services/uploadImageToS3");
const upload = multer({ storage: multer.memoryStorage() });

// Route để upload ảnh (dùng multer để nhận file ảnh)
router.post("/upload-image", upload.single("image"), async (req, res) => {
  console.log(req.file);

  try {
    const { sender_id, receiver_id, chat_type } = req.body;
    const image = req.file;

    if (!image || !sender_id || !receiver_id || !chat_type) {
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }
    // Upload file lên S3
    const imageUrl = await uploadFile(image);
    // Lưu tin nhắn ảnh vào database
    const newMessage = new Messages({
      sender_id,
      receiver_id,
      content: imageUrl, // Sử dụng URL từ S3
      type: "image",
      chat_type,
    });
    await newMessage.save();
    return res.status(201).json({
      message: "Image message sent successfully",
      data: newMessage,
    });
  } catch (err) {
    console.error("Lỗi upload ảnh:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route để gửi tin nhắn (văn bản và hình ảnh)
router.post("/send-message", upload.single("image"), async (req, res) => {
  try {
    const { sender_id, receiver_id, content, type, chat_type } = req.body;
    const image = req.file;

    if (!sender_id || !receiver_id || !chat_type || (!content && !image)) {
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }

    let messageContent = content;
    if (image) {
      const imageUrl = await uploadFile(image); // Upload ảnh lên S3 và lấy URL
      messageContent = imageUrl; // Sử dụng URL ảnh làm nội dung tin nhắn
    }

    const newMessage = new Messages({
      sender_id,
      receiver_id,
      content: messageContent,
      type,
      chat_type,
    });

    await newMessage.save();
    return res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (err) {
    console.error("Lỗi gửi tin nhắn:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Gửi tin nhắn nhóm
router.post("/send-group-message", async (req, res) => {
  try {
    const { sender_id, receiver_id, content, type } = req.body;
    // Kiểm tra group có tồn tại không
    const groupChat = await GroupChat.findOne({ chat_id: receiver_id });
    if (!groupChat) {
      return res.status(404).json({ error: "Group chat not found" });
    }

    // Tạo tin nhắn mới
    const newMessage = new Messages({
      sender_id,
      receiver_id,
      content,
      type,
      chat_type: "group",
      status: "send",
    });
    await newMessage.save();

    const groupMembers = await GroupMembers.find({
      group_id: receiver_id,
    }).select("user_id");

    // Tạo MessageCard cho từng thành viên, trừ người gửi
    const messageCards = groupMembers
      .filter((member) => member.user_id.toString() !== sender_id.toString())
      .map((member) => ({
        receiver_id: member.user_id,
        message_id: newMessage._id,
        status: "unread",
        card_color: "#FF0000",
        title: `New message in group ${groupChat.name}`,
      }));

    await MessageCard.insertMany(messageCards);

    res.status(201).json({
      message: "Group message sent successfully",
      data: {
        message: newMessage,
        group: groupChat.name,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
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

// Thu hồi tin nhắn
router.put("/recall/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Messages.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    message.type = "text";
    message.content = "Tin nhắn đã được thu hồi";
    await message.save();

    res.json({ status: "ok", message: "Message recalled successfully" });
  } catch (error) {
    console.error("Error recalling message:", error);
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

// API tìm kiếm tin nhắn theo nội dung
const Users = require("../models/UserDetails");
router.get("/messages", async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      return res.status(400).json({ error: "Search query is required" });
    }
    // Kiểm tra nếu search chỉ chứa số (có thể kèm dấu +)
    const isPhoneNumber = /^\+?\d+$/.test(search);
    if (isPhoneNumber) {
      const users = await Users.find({
        phone: { $regex: `^${search}$`, $options: "i" }, // Tìm chính xác số điện thoại
      });
      if (users.length > 0) {
        return res.json({ status: "ok", contacts: users, data: [] });
      }
    }
    // Nếu không phải số điện thoại, tìm kiếm theo tên người dùng hoặc tin nhắn
    const users = await Users.find({
      fullName: { $regex: search, $options: "i" }, // Tìm theo tên không phân biệt hoa thường
    });
    const messages = await Messages.find({
      $and: [
        { content: { $regex: search, $options: "i" } }, // Tìm kiếm từ khóa
        { content: { $ne: "Tin nhắn đã được thu hồi" } }, // Loại bỏ tin nhắn thu hồi
      ],
    }).sort({ createdAt: -1 });
    res.json({ status: "ok", contacts: users, data: messages });
  } catch (error) {
    console.error("Error searching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/message-cards/:userId", async (req, res) => {
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
});

// Tạo MessageCard
router.post("/messages/message-cards", async (req, res) => {
  try {
    const { own_id, title, card_color } = req.body;
    const newMessageCard = new MessageCard({ own_id, title, card_color });

    await newMessageCard.save();
    res.status(201).json({ status: "ok", data: newMessageCard });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
