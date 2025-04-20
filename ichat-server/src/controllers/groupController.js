const GroupModel = require("../models/groupModel");
const mongoose = require("mongoose");
const GroupChat = require("../schemas/GroupChat");

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
  // 1. Tạo group
  createGroup: async (req, res) => {
    try {
      const { name, participant_ids, admin_id } = req.body;

      // Kiểm tra và xử lý admin_id
      if (!mongoose.isValidObjectId(admin_id)) {
        return res.status(400).json({
          status: "error",
          message: "admin_id không hợp lệ",
        });
      }

      const adminObjectId = new mongoose.Types.ObjectId(admin_id);

      // Kiểm tra và xử lý participant_ids
      let participantArray;

      // Kiểm tra nếu participant_ids là chuỗi JSON
      if (
        typeof participant_ids === "string" &&
        participant_ids.startsWith("[")
      ) {
        try {
          participantArray = JSON.parse(participant_ids);
        } catch (e) {
          participantArray = participant_ids.split(",");
        }
      }
      // Nếu participant_ids là mảng
      else if (Array.isArray(participant_ids)) {
        participantArray = participant_ids;
      }
      // Nếu là chuỗi đơn (một id)
      else if (typeof participant_ids === "string") {
        participantArray = [participant_ids];
      }
      // Nếu không có
      else {
        participantArray = [];
      }

      console.log("Kiểu dữ liệu participant_ids:", typeof participant_ids);
      console.log("Giá trị gốc:", participant_ids);
      console.log("Mảng đã xử lý:", participantArray);

      const avatar = req.file ? req.file.buffer : null;

      const group = await GroupModel.createGroup({
        name,
        avatar,
        admin_id: adminObjectId,
        participant_ids: participantArray, // Truyền mảng đã xử lý
      });

      res.status(201).json({ status: "ok", data: group });
    } catch (err) {
      console.error("Lỗi tạo nhóm:", err);
      res.status(500).json({ status: "error", message: err.message });
    }
  },

  // 2. Thêm member
  addMember: async (req, res) => {
    try {
      const { groupId, userId } = req.body;
      const m = await GroupModel.addMember(groupId, userId);
      res.json({ status: "ok", data: m });
    } catch (e) {
      res.status(500).json({ status: "error", message: e.message });
    }
  },

  // 3. Remove member / leave group
  removeMember: async (req, res) => {
    try {
      const { groupId, userId } = req.body;
      await GroupModel.removeMember(groupId, userId);
      res.json({ status: "ok" });
    } catch (e) {
      res.status(500).json({ status: "error", message: e.message });
    }
  },
  // 4. Gửi tin nhắn nhóm
  sendGroupMessage: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { content, type, sender_id } = req.body; // Lấy sender_id từ req.body

      // Xử lý file nếu cần
      const imageFile = req.files?.image?.[0] || null;
      const docFile = req.files?.file?.[0] || null;
      const file = imageFile || docFile;

      const msg = await GroupModel.sendGroupMessage({
        groupId,
        sender_id,
        content,
        type,
        file, // Truyền file nếu có
      });

      res.status(201).json({ status: "ok", data: msg });
    } catch (e) {
      res.status(500).json({ status: "error", message: e.message });
    }
  },

  // 5. Đổi tên / set background
  updateGroup: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { name } = req.body;
      const avatar = req.file ? req.file.buffer : null;

      const upd = await GroupModel.updateGroup(groupId, {
        name,
        avatar,
      });

      res.json({ status: "ok", data: upd });
    } catch (e) {
      res.status(500).json({ status: "error", message: e.message });
    }
  },

  // 6. Phân quyền
  setRole: async (req, res) => {
    try {
      const { groupId, userId } = req.params;
      const { role } = req.body;
      const r = await GroupModel.setRole(groupId, userId, role);
      res.json({ status: "ok", data: r });
    } catch (e) {
      res.status(500).json({ status: "error", message: e.message });
    }
  },

  // 7. Hủy nhóm
  deleteGroup: async (req, res) => {
    try {
      const { groupId } = req.params;
      await GroupModel.deleteGroup(groupId);
      res.json({ status: "ok" });
    } catch (e) {
      res.status(500).json({ status: "error", message: e.message });
    }
  },

  // 8. Tìm kiếm tin nhắn
  searchMessages: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { q } = req.query;
      const list = await GroupModel.searchMessages(groupId, q);
      res.json({ status: "ok", data: list });
    } catch (e) {
      res.status(500).json({ status: "error", message: e.message });
    }
  },
};

module.exports = GroupController;
