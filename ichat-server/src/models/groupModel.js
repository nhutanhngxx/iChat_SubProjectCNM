const GroupChat = require("../schemas/GroupChat");
const GroupMember = require("../schemas/GroupMember");
const User = require("../schemas/UserDetails");
const Message = require("../schemas/Messages");
const mongoose = require("mongoose");
const { uploadFile } = require("../services/upload-file");

const GroupModel = {
  //   Lấy danh sách nhóm mà người dùng tham gia
  getUserGroups: async (userId) => {
    try {
      const groups = await GroupMember.find({ user_id: userId });
      const groupIds = groups.map((group) => group.group_id);
      const groupChats = await GroupChat.find({ _id: { $in: groupIds } });
      return groupChats;
    } catch (error) {
      console.error("Không tìm thấy các nhóm của người dùng:", error);
      throw new Error("Không tìm thấy group của người dùng");
    }
  },

  //   Lấy danh sách thành viên của nhóm
  getGroupMembers: async (groupId) => {
    try {
      const members = await GroupMember.find(
        { group_id: groupId },
        { user_id: 1 }
      ).lean();
      const memberIds = members.map(({ user_id }) => user_id);
      const memberDetails = await User.find(
        { _id: { $in: memberIds } },
        { full_name: 1 }
      ).lean();
      return memberDetails;
    } catch (error) {
      console.error("Không tìm thấy các thành viên của nhóm:", error);
      throw new Error("Không tìm thấy các thành viên của nhóm");
    }
  },

  //   Tìm kiếm nhóm
  searchGroup: async (keyword) => {
    try {
      const groups = await GroupChat.find({
        name: { $regex: search, $options: "i" }, // Tìm kiếm không phân biệt hoa thường
      }).sort({ created_at: -1 });
      return groups;
    } catch (error) {
      console.error("Lỗi tìm kiếm nhóm:", error);
      throw new Error("Lỗi tìm kiếm nhóm");
    }
  },
  // 1. Tạo Group mới
  createGroup: async ({ name, admin_id, avatar, participant_ids = [] }) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Đảm bảo participant_ids luôn là mảng
      const participantArray = Array.isArray(participant_ids)
        ? participant_ids
        : participant_ids
        ? participant_ids.split(",")
        : [];

      // Xử lý avatar nếu có
      let avatarUrl = null;
      if (avatar) {
        avatarUrl = await uploadFile(avatar);
      }

      // Tạo group
      const group = await GroupChat.create(
        [
          {
            name,
            admin_id,
            avatar: avatarUrl,
          },
        ],
        { session }
      );

      const gid = group[0]._id;

      // Tạo mảng thành viên với admin có role là "admin"
      const members = [];

      // Thêm admin với role="admin"
      members.push({
        group_id: gid,
        user_id: admin_id,
        role: "admin", // Thiết lập role admin
      });

      // Thêm các thành viên khác với role mặc định (member)
      if (participantArray.length > 0) {
        // Lọc ra các ID khác với admin để tránh trùng lặp
        const otherMembers = participantArray
          .filter((id) => String(id) !== String(admin_id))
          .map((uid) => ({
            group_id: gid,
            user_id: uid,
            // role mặc định là "member" từ schema
          }));

        members.push(...otherMembers);
      }

      await GroupMember.insertMany(members, { session });
      await session.commitTransaction();
      return group[0];
    } catch (err) {
      await session.abortTransaction();
      console.error("Lỗi khi tạo nhóm:", err);
      throw err;
    } finally {
      session.endSession();
    }
  },

  // 2. Thêm thành viên
  addMember: async (groupId, userId) => {
    return GroupMember.create({ group_id: groupId, user_id: userId });
  },

  // 3. Xóa thành viên / Rời nhóm
  removeMember: async (groupId, userId) => {
    return GroupMember.deleteOne({ group_id: groupId, user_id: userId });
  },
  // 4. Gửi tin nhắn nhóm
  sendGroupMessage: async ({ groupId, sender_id, content, type, file }) => {
    let messageContent = content;

    // Xử lý file nếu có
    if (file) {
      const fileUrl = await uploadFile(file);
      messageContent = fileUrl;
    }

    const msg = await Message.create({
      sender_id,
      chat_type: "group",
      receiver_id: groupId,
      content: messageContent,
      type,
    });

    return msg;
  },

  // 5. Đổi tên Group / Set avatar
  updateGroup: async (groupId, { name, avatar }) => {
    try {
      const update = {};

      // Chỉ cập nhật tên nếu có
      if (name) {
        update.name = name;
      }

      // Chỉ cập nhật avatar nếu có
      if (avatar) {
        const avatarUrl = await uploadFile(avatar);
        update.avatar = avatarUrl; // Sửa từ avatarUrl thành avatar để phù hợp
      }

      return GroupChat.findByIdAndUpdate(groupId, update, { new: true });
    } catch (error) {
      console.error("Lỗi cập nhật nhóm:", error);
      throw error;
    }
  },

  // 6. Phân quyền (role: "admin"|"moderator"|"member")
  setRole: async (groupId, userId, role) => {
    return GroupMember.findOneAndUpdate(
      { group_id: groupId, user_id: userId },
      { role },
      { new: true }
    );
  },

  // 7. Hủy nhóm (chỉ creator)
  deleteGroup: async (groupId) => {
    await GroupMember.deleteMany({ group_id: groupId });
    return GroupChat.findByIdAndDelete(groupId);
  },

  // 8. Tìm kiếm tin nhắn trong group
  searchMessages: async (groupId, keyword) => {
    return Message.find({
      chat_type: "group",
      receiver_id: groupId,
      content: { $regex: keyword, $options: "i" },
    }).sort({ timestamp: -1 });
  },
};

module.exports = GroupModel;
