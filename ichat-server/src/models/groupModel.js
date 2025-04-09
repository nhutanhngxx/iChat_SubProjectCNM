const GroupChat = require("../schemas/GroupChat");
const GroupMember = require("../schemas/GroupMember");
const User = require("../schemas/UserDetails");

const GroupModel = {
  createGroup: async (groupData) => {},

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
};

module.exports = GroupModel;
