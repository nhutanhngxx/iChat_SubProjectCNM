const express = require("express");
const GroupMembers = require("../models/GroupMember");
const GroupChats = require("../models/GroupChat");
const Message = require("../models/Messages");

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
// Lấy danh sách nhóm mà người dùng tham gia kèm tin nhắn gần nhất
router.get("/groups-message/:userId", async (req, res) => {
  try {
    // Lấy danh sách nhóm mà user tham gia
    const groups = await GroupMembers.find({ user_id: req.params.userId });
    const groupIds = groups.map((group) => group.group_id);

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
module.exports = router;
