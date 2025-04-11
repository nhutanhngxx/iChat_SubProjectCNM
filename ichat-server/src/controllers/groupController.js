const GroupModel = require("../models/groupModel");

const GroupController = {
  // Lấy danh sách nhóm mà người dùng tham gia
  getUserGroups: async (req, res) => {
    const userId = req.params.userId;
    try {
      const groupChats = await GroupModel.getUserGroups(userId);

      if (!groupChats) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy các nhóm của người dùng",
        });
      }
      if (groupChats.length === 0) {
        return res.status(200).json({
          status: "oke",
          message: "Người dùng không tham gia nhóm nào",
          data: [],
        });
      }
      return res.json({ status: "ok", data: groupChats });
    } catch (err) {
      res.status(500).json({ status: "error", message: err });
    }
  },

  //   Lấy danh sách nhóm mà người dùng tham gia - Cách 1 trả về Array
  getGroupMembers: async (req, res) => {
    const groupId = req.params.groupId;
    try {
      const members = await GroupModel.getGroupMembers(groupId);
      res.json({ status: "ok", data: members });
    } catch (err) {
      res.status(500).json({ status: "error", message: err });
    }
  },

  //   Lấy danh sách thành viên của nhóm - Cách 2 trả về Map
  //   getGroupMembers: async (req, res) => {
  // try {
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
  //   } catch (err) {
  // res.status(500).json({ message: err });
  // }
  //   },

  //   Tìm kiếm nhóm
  searchGroup: async (req, res) => {
    const { search } = req.query;
    if (!search) {
      return res.status(400).json({ error: "Thiếu từ khóa tìm kiếm." });
    }
    try {
      const groups = await GroupModel.searchGroup(search);
      res.json({ status: "ok", contacts: null, data: groups });
    } catch (error) {
      console.error("Error searching messages:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = GroupController;
