const express = require("express");
const GroupMembers = require("../Schema/GroupMember");
const GroupChats = require("../Schema/GroupChat");

const router = express.Router();

// Lấy dan sách nhóm mà người dùng tham gia
router.get("/groups/:userId", async (req, res) => {
  try {
    const groups = await GroupMembers.find({ user_id: req.params.userId });
    const groupIds = groups.map((group) => group.group_id);
    const groupChats = await GroupChats.find({ _id: { $in: groupIds } });
    res.status(201).json(groupChats);
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

module.exports = router;
