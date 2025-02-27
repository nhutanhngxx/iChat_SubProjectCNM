const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = mongoose.model('Messages');

// Tạo tin nhắn mới
router.post('/add', async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();
        res.status(201).json({ message: "Thêm tin nhắn thành công!", data: newMessage });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi thêm tin nhắn", error });
    }
});

module.exports = router;
