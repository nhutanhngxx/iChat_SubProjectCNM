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

  // Thêm nhiều thành viên cùng lúc
  addMembers: async (req, res) => {
    try {
      const { groupId, userIds } = req.body;

      if (!groupId) {
        return res
          .status(400)
          .json({ status: "error", message: "Thiếu groupId" });
      }

      if (!userIds || (Array.isArray(userIds) && userIds.length === 0)) {
        return res
          .status(400)
          .json({ status: "error", message: "Thiếu userIds" });
      }

      const result = await GroupModel.addMembers(groupId, userIds);

      res.json({
        status: "ok",
        data: result,
      });
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

  // // 4. Gửi tin nhắn nhóm
  // sendGroupMessage: async (req, res) => {
  //   try {
  //     const { groupId } = req.params;
  //     const { content, type, sender_id } = req.body; // Lấy sender_id từ req.body

  //     // Xử lý file nếu cần
  //     const imageFile = req.files?.image?.[0] || null;
  //     const docFile = req.files?.file?.[0] || null;
  //     const file = imageFile || docFile;

  //     const msg = await GroupModel.sendGroupMessage({
  //       groupId,
  //       sender_id,
  //       content,
  //       type,
  //       file, // Truyền file nếu có
  //     });

  //     res.status(201).json({ status: "ok", data: msg });
  //   } catch (e) {
  //     res.status(500).json({ status: "error", message: e.message });
  //   }
  // },

  // 5. Đổi tên / set background
  updateGroup: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { name } = req.body;
      const avatar = req.file ? req.file.buffer : null;
      const allow_add_members = req.body.allow_add_members || true;
      const allow_change_name = req.body.allow_change_name || true;
      const allow_change_avatar = req.body.allow_change_avatar || true;
      const upd = await GroupModel.updateGroup(groupId, {
        name,
        avatar,
        allow_add_members,
        allow_change_name,
        allow_change_avatar,
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

  // 7. Xóa nhóm
  deleteGroup: async (req, res) => {
    try {
      const { groupId } = req.params;
      await GroupModel.deleteGroup(groupId);
      res.json({ status: "ok" });
    } catch (e) {
      res.status(500).json({ status: "error", message: e.message });
    }
  },

  // 8. Tìm kiếm tin nhắn trong nhóm
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

  // 9. Trả về thông tin nhóm
  getGroupById: async (req, res) => {
    try {
      const { groupId } = req.params;
      const group = await GroupModel.getGroupById(groupId);
      if (!group) {
        return res
          .status(404)
          .json({ status: "error", message: "Group not found" });
      }
      return res.json({ status: "ok", data: group });
    } catch (e) {
      console.error("Lỗi lấy thông tin nhóm:", e);
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  // Controller để kiểm tra người dùng có phải admin chính/ phụ không
  isGroupSubAdmin: async (req, res) => {
    try {
      const { groupId, userId } = req.params; // hoặc req.body

      const result = await GroupModel.isGroupSubAdmin(groupId, userId);

      return res.status(200).json({
        status: "ok",
        data: result,
      });
    } catch (error) {
      console.error("Lỗi kiểm tra admin phụ:", error);
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },
  // Chuyển nhường quyền admin cho người khác
  transferAdmin: async (req, res) => {
    try {
      const { groupId, userId } = req.params; // hoặc req.body

      const result = await GroupModel.transferAdmin(groupId, userId);

      return res.status(200).json({
        status: "ok",
        data: result,
      });
    } catch (error) {
      console.error("Lỗi chuyển nhường quyền admin:", error);
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },
};

module.exports = GroupController;
