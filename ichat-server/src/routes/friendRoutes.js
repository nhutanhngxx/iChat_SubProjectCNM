const express = require("express");
const router = express.Router();

const FriendshipController = require("../controllers/friendController");

// Gửi lời mời kết bạn
router.post("/send-friend-request", FriendshipController.sendFriendRequest);

// Chấp nhận lời mời kết bạn
router.post("/accept-friend-request", FriendshipController.acceptFriendRequest);

// Hủy lời mời kết bạn
router.post("/cancel-friend-request", FriendshipController.cancelFriendRequest);

// Chặn người dùng
router.post("/block-user", FriendshipController.blockUser);

// Hủy kết bạn (Đã chấp nhận lời mời kết bạn)
router.post("/unfriend", FriendshipController.unfriendUser);

// Xem danh sách bạn bè
router.get("/friends/:user_id", FriendshipController.getUserFriends);

// Gợi ý kết bạn (Dựa trên bạn chung)
router.get(
  "/friend-suggestions/:user_id",
  FriendshipController.getListFriendsSugestion
);

// Đếm số lượng bạn chung giữa 2 user
router.get(
  "/mutual-friends/:user1_id/:user2_id",
  FriendshipController.countMutalFriends
);

module.exports = router;
