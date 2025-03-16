const express = require("express");
const GroupMembers = require("../models/GroupMember");
const GroupChats = require("../models/GroupChat");

const router = express.Router();

// Lấy danh sách nhóm mà người dùng tham gia
router.get("/groups/:userId", async (req, res) => {
  try {
    const groups = await GroupMembers.find({ user_id: req.params.userId });
    const groupIds = groups.map((group) => group.group_id);
    const groupChats = await GroupChats.find({ _id: { $in: groupIds } });
    res.json(groupChats);
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

// Tìm kiếm nhóm
router.get("/groups", async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const groups = await GroupChats.find({
      name: { $regex: search, $options: "i" }, // Tìm kiếm không phân biệt hoa thường
    }).sort({ created_at: -1 });

    res.json({ status: "ok", contacts: null, data: groups });
  } catch (error) {
    console.error("Error searching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Lấy danh sách thành viên của nhóm
router.get("/groups/:groupId/members", async (req, res) => {
  try {
    const members = await GroupMembers.find({ group_id: req.params.groupId });
    res.json({ status: "ok", data: members });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

module.exports = router;
