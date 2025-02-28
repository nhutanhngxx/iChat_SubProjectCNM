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

module.exports = router;
