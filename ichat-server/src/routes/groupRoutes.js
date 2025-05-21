const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const GroupController = require("../controllers/groupController");

router.get("/search/:userId", GroupController.searchGroup); // Tìm kiếm nhóm
router.get("/:userId", GroupController.getUserGroups); // Lấy danh sách nhóm mà người dùng tham gia
router.get("/:groupId/members", GroupController.getGroupMembers); // Lấy danh sách thành viên của nhóm
router.post("/", upload.single("avatar"), GroupController.createGroup); // Tạo nhóm mới
router.post("/add-member", GroupController.addMember); // Thêm thành viên vào nhóm
router.post("/add-members", GroupController.addMembers); // Thêm nhiều thành viên vào nhóm
router.post("/remove-member", GroupController.removeMember); // Xóa thành viên khỏi nhóm
router.put("/:groupId", upload.single("avatar"), GroupController.updateGroup); // Cập nhật thông tin nhóm
router.delete("/:groupId", GroupController.deleteGroup); // Xóa nhóm
// router.post(
//   "/:groupId/messages",
//   upload.fields([
//     { name: "image", maxCount: 1 },
//     { name: "file", maxCount: 1 },
//   ]),
//   GroupController.sendGroupMessage
// ); //Gửi tin nhắn nhóm
router.get("/:groupId/messages/search", GroupController.searchMessages); // Tìm kiếm tin nhắn trong nhóm
router.put("/:groupId/members/:userId/role", GroupController.setRole); // Cập nhật quyền thành viên trong nhóm
router.get("/group/:groupId", GroupController.getGroupById); // Lấy thông tin nhóm
router.get("/:groupId/admin-check/:userId", GroupController.isGroupSubAdmin); // Kiểm tra quyền admin (Phụ hay chính)
router.put("/transferAdmin/:groupId/:userId", GroupController.transferAdmin); // Chuyển quyền admin cho người khác

// Tạo lời mời nhóm
router.post("/:groupId/invitations", GroupController.createInvitation);

// Lấy danh sách lời mời nhóm
router.get("/:groupId/invitations", GroupController.getGroupInvitations);

// Hủy lời mời
router.delete("/invitations/:inviteId", GroupController.revokeInvitation);

// Tham gia nhóm bằng lời mời
router.post("/join-by-invite", GroupController.joinByInvitation);
router.get("/member-approval/:groupId", GroupController.checkMemberApproval); // Kiểm tra trạng thái của phê duyệt thành viên của nhóm
router.put("/member-approval/:groupId", GroupController.updateMemberApproval); // Cập nhật trạng thái của phê duyệt thành viên của nhóm
router.get("/pending-members/:groupId", GroupController.getPendingMembers); // Lấy danh sách yêu cầu tham gia nhóm đang chờ duyệt
router.put("/accept-member/:groupId/:memberId", GroupController.acceptMember); // Chấp nhận thành viên vào nhóm
router.put("/reject-member/:groupId/:memberId", GroupController.rejectMember); // Từ chối thành viên vào nhóm
router.get(
  "/invited-members/:groupId/:userId",
  GroupController.getInvitedMembersByUserId
); // Lấy danh sách thành viên được mời bởi bạn

module.exports = router;
