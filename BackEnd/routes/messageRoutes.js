const express = require('express');
const router = express.Router();
const Messages = require('../Schema/Messages');
const MessageCard = require('../Schema/MessageCard');

// Gửi tin nhắn
router.post('/messages', async (req, res) => {
    try {
        const newMessage = new Messages(req.body);
        await newMessage.save();

        // Tự động tạo MessageCard với trạng thái unread
        const messageCard = new MessageCard({
            receiver_id: newMessage.receiver_id,
            message_id: newMessage._id,
            status: "unread",
            card_color: "#FF0000", // Màu đỏ cho tin nhắn chưa đọc
            title: "New Message"
        });
        await messageCard.save();

        res.status(201).json({ message: "Message sent successfully", data: newMessage });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
