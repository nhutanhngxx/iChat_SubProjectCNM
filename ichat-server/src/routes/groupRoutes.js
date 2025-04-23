const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const GroupController = require("../controllers/groupController");

router.get("/:userId", GroupController.getUserGroups); // Lấy danh sách nhóm mà người dùng tham gia
router.get("/search", GroupController.searchGroup); // Tìm kiếm nhóm
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
module.exports = router;
