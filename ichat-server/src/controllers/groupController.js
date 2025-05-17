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

  // Lấy danh sách nhóm mà người dùng tham gia - Cách 1 trả về Array
  getGroupMembers: async (req, res) => {
    const groupId = req.params.groupId;
    try {
      const members = await GroupModel.getGroupMembers(groupId);
      res.json({ status: "ok", data: members });
    } catch (err) {
      res.status(500).json({ status: "error", message: err });
    }
  },

  // Tìm kiếm nhóm
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

      const avatar = req.file;

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
      const { groupId, userIds, inviterId } = req.body;

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

      const result = await GroupModel.addMembers(groupId, userIds, inviterId);

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
      const { groupId, userId, adminId } = req.body;
      await GroupModel.removeMember(groupId, userId, adminId);
      res.json({ status: "ok" });
    } catch (e) {
      res.status(500).json({ status: "error", message: e.message });
    }
  },

  // 5. Đổi tên / set background
  updateGroup: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { name } = req.body;
      const avatar = req.file || null;
      // const allow_add_members = req.body.allow_add_members;
      // const allow_change_name = req.body.allow_change_name;
      // const allow_change_avatar = req.body.allow_change_avatar;
      const currentUserId = req.body.currentUserId;
      // console.log(groupId, name, avatar);

      // const upd = await GroupModel.updateGroup(
      //   groupId,
      //   {
      //     name,
      //     avatar,
      //     allow_add_members,
      //     allow_change_name,
      //     allow_change_avatar,
      //   },
      //   currentUserId
      // );

      const update = {
        name,
        avatar,
      };

      console.log("Update data:", update);

      // Chỉ thêm vào update nếu client thực sự gửi các giá trị này

      if (req.body.allow_change_name !== undefined) {
        update.allow_change_name = req.body.allow_change_name === true;
      }

      if (req.body.allow_change_avatar !== undefined) {
        update.allow_change_avatar = req.body.allow_change_avatar === true;
      }

      if (req.body.require_approval !== undefined) {
        update.require_approval = req.body.require_approval === true;
      }

      console.log("Update data:", update, "currentUserId:", currentUserId);

      const upd = await GroupModel.updateGroup(groupId, update, currentUserId);

      res.json({ status: "ok", data: upd });
    } catch (e) {
      res.status(500).json({ status: "error", message: e.message });
    }
  },

  // 6. Phân quyền
  setRole: async (req, res) => {
    try {
      const { groupId, userId } = req.params;
      const { role, adminId } = req.body;
      const r = await GroupModel.setRole(groupId, userId, role, adminId);
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
      const { currentAdminId } = req.body; // ID của admin hiện tại
      const result = await GroupModel.transferAdmin(
        groupId,
        userId,
        currentAdminId
      );

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

  // Tạo lời mời nhóm
  createInvitation: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { userId, expiresInHours, maxUses } = req.body;

      const invitation = await GroupModel.createGroupInvitation(
        groupId,
        userId,
        expiresInHours || 24,
        maxUses || null
      );

      const inviteUrl = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/invite/${invitation.token}`;

      res.status(201).json({
        status: "ok",
        data: {
          invitation,
          inviteUrl,
          qrData: invitation.token,
        },
      });
    } catch (error) {
      res.status(400).json({});
    }
  },

  // Kiểm tra trạng thái của phê duyệt thành viên của nhóm
  checkMemberApproval: async (req, res) => {
    try {
      const { groupId } = req.params;

      const result = await GroupModel.checkMemberApproval(groupId);

      return res.status(200).json({
        status: "ok",
        data: result,
      });
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái phê duyệt thành viên:", error);
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },

  // Cập nhật trạng thái của phê duyệt thành viên của nhóm
  updateMemberApproval: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { requireApproval } = req.body;

      const result = await GroupModel.updateMemberApproval({
        groupId,
        requireApproval,
      });

      return res.status(200).json({
        status: "ok",
        data: result,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái phê duyệt thành viên:", error);
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },

  // Xác thực và tham gia nhóm
  joinByInvitation: async (req, res) => {
    try {
      const { token, userId } = req.body;

      const group = await GroupModel.validateAndJoinGroup(token, userId);

      res.status(200).json({
        status: "ok",
        message: "Đã tham gia nhóm thành công",
        data: group,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  },

  // Hủy lời mời
  revokeInvitation: async (req, res) => {
    try {
      const { inviteId } = req.params;
      const { userId } = req.body;

      await GroupModel.revokeInvitation(inviteId, userId);

      res.status(200).json({
        status: "ok",
        message: "Đã hủy lời mời thành công",
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  },

  // Lấy danh sách lời mời của nhóm
  getGroupInvitations: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { userId } = req.query;

      const invitations = await GroupModel.getGroupInvitations(groupId, userId);

      res.status(200).json({
        status: "ok",
        data: invitations,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  },

  // Lấy danh sách yêu cầu tham gia nhóm đang chờ duyệt
  getPendingMembers: async (req, res) => {
    try {
      const { groupId } = req.params;
      const pendingMembers = await GroupModel.getPendingMembers(groupId);
      return res.json({ status: "ok", data: pendingMembers });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu cầu tham gia:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  // Lấy danh sách thành viên được mời bởi bạn
  getInvitedMembersByUserId: async (req, res) => {
    try {
      const { userId, groupId } = req.params;
      const invitedMembers = await GroupModel.getInvitedMembersByUserId({
        userId,
        groupId,
      });
      return res.json({ status: "ok", data: invitedMembers });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thành viên được mời:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  // Chấp nhận thành viên vào nhóm
  acceptMember: async (req, res) => {
    try {
      const { groupId, memberId } = req.params;
      const { adminId } = req.body;
      const acceptedMember = await GroupModel.acceptMember({
        groupId,
        memberId,
        adminId,
      });
      return res.json({ status: "ok", data: acceptedMember });
    } catch (error) {
      console.error("Lỗi khi chấp nhận thành viên:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  },

  // Từ chối thành viên vào nhóm
  rejectMember: async (req, res) => {
    try {
      const { groupId, memberId } = req.params;
      const { adminId } = req.body;
      await GroupModel.rejectMember({ groupId, memberId, adminId });
      return res.json({ status: "ok" });
    } catch (error) {
      console.error("Lỗi khi từ chối thành viên:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  },
};

module.exports = GroupController;
