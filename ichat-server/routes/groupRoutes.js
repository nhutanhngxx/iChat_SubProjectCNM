const express = require("express");
const GroupMember = require("../models/GroupMember");
const GroupChat = require("../models/GroupChat");
const User = require("../models/UserDetails");

const router = express.Router();

// Lấy danh sách nhóm mà người dùng tham gia
router.get("/groups/:userId", async (req, res) => {
  try {
    const groups = await GroupMember.find({ user_id: req.params.userId });
    const groupIds = groups.map((group) => group.group_id);
    const groupChats = await GroupChat.find({ _id: { $in: groupIds } });
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

    const groups = await GroupChat.find({
      name: { $regex: search, $options: "i" }, // Tìm kiếm không phân biệt hoa thường
    }).sort({ created_at: -1 });

    res.json({ status: "ok", contacts: null, data: groups });
  } catch (error) {
    console.error("Error searching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Lấy danh sách thành viên của nhóm - Cách 1 trả về Array
router.get("/groups/:groupId/members", async (req, res) => {
  try {
    const members = await GroupMember.find({ group_id: req.params.groupId });
    const memberIds = members.map((member) => member.user_id);
    const memberDetails = await User.find(
      { _id: { $in: memberIds } },
      { full_name: 1 }
    );
    res.json({ status: "ok", data: memberDetails });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

// Lấy danh sách thành viên của nhóm - Cách 2 trả về Map
// router.get("/groups/:groupId/members", async (req, res) => {
//   try {
//     const members = await GroupMember.find({ group_id: req.params.groupId });
//     const memberIds = members.map((member) => member.user_id);
//     const memberDetails = await User.find(
//       { _id: { $in: memberIds } },
//       { full_name: 1 }
//     );

//     // Chuyển mảng thành map với key là _id
//     const membersMap = {};
//     memberDetails.forEach((member) => {
//       membersMap[member._id] = member;
//     });

//     res.json({ status: "ok", data: membersMap });
//   } catch (err) {
//     res.status(500).json({ message: err });
//   }
// });

module.exports = router;
