const express = require("express");
<<<<<<< HEAD
const GroupMembers = require("../models/GroupMember");
const GroupChats = require("../models/GroupChat");
const Message = require("../models/Messages");
=======
const GroupMember = require("../models/GroupMember");
const GroupChat = require("../models/GroupChat");
const User = require("../models/UserDetails");
>>>>>>> b829b0d9f5efab3b406f8f028fcde6f8ee876a68

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
// Lấy danh sách nhóm mà người dùng tham gia kèm tin nhắn gần nhất
router.get("/groups-message/:userId", async (req, res) => {
  try {
    // Lấy danh sách nhóm mà user tham gia
    const groups = await GroupMembers.find({ user_id: req.params.userId });
    const groupIds = groups.map((group) => group.group_id);

<<<<<<< HEAD
    // Lấy thông tin nhóm
    const groupChats = await GroupChats.find({ _id: { $in: groupIds } });

    // Lấy tin nhắn gần nhất cho từng nhóm
    const groupsWithLastMessage = await Promise.all(
      groupChats.map(async (group) => {
        const lastMessage = await Message.findOne({
          receiver_id: group._id,
          chat_type: "group",
        })
          .sort({ timestamp: -1 }) // Lấy tin nhắn mới nhất
          .limit(1);

        return {
          group_id: group._id,
          name: group.name,
          admin_id: group.admin_id,
          avatar: group.avatar,
          created_at: group.created_at,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                sender_id: lastMessage.sender_id,
                timestamp: lastMessage.timestamp,
                type: lastMessage.type,
              }
            : null,
        };
      })
    );

    res.json(groupsWithLastMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
=======
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

>>>>>>> b829b0d9f5efab3b406f8f028fcde6f8ee876a68
module.exports = router;
