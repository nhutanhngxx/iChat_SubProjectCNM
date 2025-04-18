const express = require("express");
const router = express.Router();
const GroupController = require("../controllers/groupController");

router.get("/:userId", GroupController.getUserGroups); // Lấy danh sách nhóm mà người dùng tham gia
router.get("/search", GroupController.searchGroup); // Tìm kiếm nhóm
router.get("/:groupId/members", GroupController.getGroupMembers); // Lấy danh sách thành viên của nhóm

module.exports = router;
