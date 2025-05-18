const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { uploadFile } = require("../services/upload-file");

const MessageController = require("../controllers/messageController");

router.post(
  "/upload-image",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  MessageController.uploadImage
);

// Route để gửi tin nhắn (văn bản và hình ảnh)
router.post(
  "/send-message",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "file", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  MessageController.sendMessage
);

// Gửi tin nhắn nhóm
router.post("/send-group-message", MessageController.sendGroupMessage);
// recentReceivers
router.get("/recent-receivers/:senderId", MessageController.recentReceivers);

// Thu hồi tin nhắn
router.put("/recall/:messageId", MessageController.recallToMessage);

// Thêm reactions cho tin nhắn
router.post("/:messageId/reactions", MessageController.addReactionToMessage);

// Chuyển tiếp tin nhắn
router.post("/forward", MessageController.forwardMessage);

// Xóa reactions
router.delete(
  "/:messageId/reactions/:userId",
  MessageController.removeReactionToMessage
);

// Ghim hoặc bỏ ghim tin nhắn
router.patch("/:messageId/pin", MessageController.pinMessage);

// Danh sách tin nhắn đã ghim
router.get("/pinned/:chatId", MessageController.getPinnedMessages);

// Trả lời tin nhắn
router.post("/reply", MessageController.replyToMessage);

// API tìm kiếm tin nhắn theo nội dung
router.get("/search/:userId", MessageController.searchMessages);

router.get("/message-cards/:userId", MessageController.getUserMessagesCards);

// Tạo MessageCard
router.post("/message-cards", MessageController.createMessageCard);

// Cập nhật tất cả tin nhắn "sent" và "received" thành "viewed" khi user mở cuộc trò chuyện
router.put("/viewed", MessageController.updateMessagesViewedStatus);

// Lấy danh sách các tin nhắn liên quan đến người dùng
router.get("/:userId", MessageController.getUserMessages);

// Lấy tin nhắn theo Người đăng nhập và các người dùng khác
router.get("/:userId/:receiverId", MessageController.getPrivateMessages);

// Xóa tất cả tin nhắn giữa người dùng đăng nhập và người nhận
router.delete("/:userId/:receiverId", MessageController.deleteAllMessages);

// Xoá ẩn tin nhắn giữa người dùng đăng nhập và người nhận
router.post("/softDelete", MessageController.softDeleteMessagesForUser);

// Gửi nhiều ảnh
router.post(
  "/send-multiple-images",
  upload.array("images", 10), // Giới hạn 10 ảnh
  MessageController.sendMultipleImages
);
// Xoá lịch sử trò chuyện
router.post("/delete-all-messages", MessageController.deleteAllMessagesForUser);
// Tin nhắn mới nhất(read_by)
router.put("/markMessagesAsRead", MessageController.markMessagesAsRead);

module.exports = router;
