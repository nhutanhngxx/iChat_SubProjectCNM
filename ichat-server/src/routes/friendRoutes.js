const express = require("express");
const router = express.Router();

const FriendshipController = require("../controllers/friendController");

// // Kiểm tra trạng thái chặn giữa hai người dùng
// router.get(
//   "/check-blocking-status/:userId/:otherUserId",
//   FriendshipController.checkBlockingStatus
// );

// // Kiểm tra trạng thái kết bạn giữa 2 người dùng
// router.get(
//   "/check-friend-status/:user_id/:target_id",
//   FriendshipController.checkFriendStatus
// );

// Danh sách bạn bè
router.get("/:userId", FriendshipController.getFriendListByUserId);

// Danh sách lời mời kết bạn đã gửi
router.get("/sent-requests/:userId", FriendshipController.sentFriendRequests);

// Danh sách lời mời kết bạn đã nhận
router.get(
  "/received-requests/:userId",
  FriendshipController.receivedFriendRequests
);

// Gửi lời mời kết bạn
router.post("/send-friend-request", FriendshipController.sendFriendRequest);

// Từ chối lời mời kết bạn
router.post("/reject-friend-request", FriendshipController.cancelFriendRequest);

// Chấp nhận lời mời kết bạn
router.post("/accept-friend-request", FriendshipController.acceptFriendRequest);

// Hủy lời mời kết bạn
router.post("/cancel-friend-request", FriendshipController.cancelFriendRequest);

// Chặn người dùng
router.post("/block-user", FriendshipController.blockUser);

// Bỏ chặn người dùng
router.post("/unblock-user", FriendshipController.unblockUser);

// Lấy danh sách người dùng bị chặn
router.get("/blocked-users/:userId", FriendshipController.getBlockedUsers);

// Kiểm tra trạng thái chặn giữa 2 người dùng
router.get(
  "/check-block-status/:user_id/:target_id",
  FriendshipController.checkBlockStatus
);

// Kiểm tra trạng thái kết bạn giữa 2 người dùng
router.get(
  "/check-friend-status/:user_id/:target_id",
  FriendshipController.checkFriendStatus
);

// Hủy kết bạn (Đã chấp nhận lời mời kết bạn)
router.post("/unfriend", FriendshipController.unfriendUser);

// Xem danh sách bạn bè
router.get("/friends/:userId", FriendshipController.getUserFriends);

// Gợi ý kết bạn (Dựa trên bạn chung)
router.get(
  "/friend-suggestions/:userId",
  FriendshipController.getListFriendsSugestion
);

// Đếm số lượng bạn chung giữa 2 user
router.get(
  "/mutual-friends/:user1Id/:user2Id",
  FriendshipController.countMutalFriends
);

module.exports = router;
