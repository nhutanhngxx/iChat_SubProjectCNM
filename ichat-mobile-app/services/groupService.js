import { apiService } from "./api";
import messageService from "./messageService";

// Tính thời gian
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi"; // Tiếng việt nè

dayjs.extend(relativeTime);
dayjs.locale("vi");

const getTimeAgo = (timestamp) => {
  return dayjs(timestamp).fromNow(); // Hiển thị "X phút trước"
};
const PREFIX = "groups";

// Format danh sách nhóm để hiển thị trên component Chatting
// const formatGroupList = async (groups) => {
//   if (!Array.isArray(groups)) {
//     return [];
//   }
//   // Gọi fetchMessages() song song để lấy tin nhắn
//   await Promise.all(
//     groups.map(async (group) => {
//       const messages = await messageService.getMessagesByGroupId(group._id);
//       if (messages && messages.length > 0) {
//         group.lastMessage = messages[messages.length - 1];
//       }
//     })
//   );

//   return groups.map((group) => {
//     const lastMessageTime = new Date(group.lastMessage?.timestamp).getTime();
//     return {
//       id: group._id,
//       name: group.name,
//       avatar: {
//         uri:
//           group.avatar ||
//           "https://nhutanhngxx.s3.ap-southeast-1.amazonaws.com/root/new-logo.png",
//       },
//       lastMessage:
//         group?.lastMessage.type === "image"
//           ? "[Hình ảnh]"
//           : group.lastMessage.content,
//       lastMessageTime: lastMessageTime,
//       time: getTimeAgo(lastMessageTime),
//       chatType: "group",
//     };
//   });
// };

const formatGroupList = async (groups) => {
  if (!Array.isArray(groups)) {
    console.log("Groups không phải mảng:", groups);
    return [];
  }

  try {
    // Map và đảm bảo format nhất quán cho mỗi group
    const formattedGroups = await Promise.all(
      groups.map(async (group) => {
        // Lấy tin nhắn cuối cùng của nhóm
        const messages = await messageService.getMessagesByGroupId(
          group._id || group.id
        );
        const lastMessage =
          messages && messages.length > 0
            ? messages[messages.length - 1]
            : null;

        // Format tin nhắn cuối
        let lastMessageContent = "Chưa có tin nhắn";
        let lastMessageTime = new Date(
          group.created_at || Date.now()
        ).getTime();
        let timeAgo = getTimeAgo(new Date(group.created_at || Date.now()));

        if (lastMessage) {
          // Format nội dung dựa vào loại tin nhắn
          switch (lastMessage.type) {
            case "file":
              lastMessageContent = "[Tệp đính kèm]";
              break;
            case "image":
              lastMessageContent = "[Hình ảnh]";
              break;
            case "video":
              lastMessageContent = "[Video]";
              break;
            case "audio":
              lastMessageContent = "[Tệp âm thanh]";
              break;
            default:
              lastMessageContent = lastMessage.content;
          }

          // Cập nhật thời gian
          lastMessageTime = new Date(lastMessage.timestamp).getTime();
          timeAgo = getTimeAgo(new Date(lastMessage.timestamp));
        }

        return {
          id: group._id || group.id,
          name: group.name || "Nhóm chưa đặt tên",
          avatar: group.avatar
            ? { uri: group.avatar }
            : "https://nhutanhngxx.s3.ap-southeast-1.amazonaws.com/root/new-logo.png",
          members: Array.isArray(group.members) ? group.members : [],
          lastMessage: lastMessageContent,
          lastMessageTime: lastMessageTime,
          time: timeAgo,
          unreadCount: group.unreadCount || 0,
          chatType: "group",
        };
      })
    );

    // Sắp xếp theo thời gian tin nhắn cuối cùng
    const sortedGroups = formattedGroups.sort(
      (a, b) => b.lastMessageTime - a.lastMessageTime
    );

    return sortedGroups;
  } catch (error) {
    console.error("Lỗi khi format groups:", error);
    return [];
  }
};

const groupService = {
  getAllGroupsByUserId: async (userId) => {
    try {
      const response = await apiService.get(`/${PREFIX}/${userId}`);
      return formatGroupList(response.data.data);
    } catch (error) {
      return [];
    }
  },
  getGroupMembers: async (groupId) => {
    try {
      const members = await apiService.get(`/${PREFIX}/${groupId}/members`);
      return members.data.data;
    } catch (error) {
      console.log("Group Service Error: ", error);
      return [];
    }
  },

  getGroupById: async (groupId) => {
    try {
      const response = await apiService.get(`/${PREFIX}/group/${groupId}`);
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      console.log("Group Service Error: ", error);
      return null;
    }
  },

  // Tạo nhóm
  createGroup: async ({ groupName, adminId, participantIds }) => {
    try {
      const response = await apiService.post(`/${PREFIX}/`, {
        name: groupName,
        admin_id: adminId,
        participant_ids: participantIds,
      });
      if (response.data.status === "error") {
        throw new Error(response.data.message);
      }
      return response.data;
    } catch (error) {
      console.log("Không thể tạo nhóm: ", error);
      throw error;
    }
  },

  // Xóa/giải tán nhóm
  deleteGroup: async (groupId) => {
    try {
      const response = await apiService.delete(`/${PREFIX}/${groupId}`);
      if (response.data.status === "error") {
        throw new Error(response.data.message);
      }
      if (response.data.status === "ok") {
        return { status: "ok", message: "Xóa nhóm thàn công." };
      }
    } catch (error) {
      console.log("Không thể xóa nhóm: ", error);
      throw error;
    }
  },

  // Đổi tên nhóm
  renameGroup: async ({ groupId, name }) => {
    try {
      const response = await apiService.put(`/${PREFIX}/${groupId}`, {
        name,
      });

      if (response.data.status === "error") {
        throw new Error(response.data.message);
      }
      if (response.data.status === "ok") {
        return { status: "ok", message: "Đổi tên nhóm thành công." };
      }
    } catch (error) {
      console.log("Không thể đổi tên nhóm: ", error);
      throw error;
    }
  },

  // Thêm thành viên mới
  addMember: async ({ groupId, userIds, inviterId }) => {
    try {
      const response = await apiService.post(`/${PREFIX}/add-members`, {
        groupId,
        userIds,
        inviterId,
      });
      if (response.data.status === "error") {
        throw new Error(response.data.message);
      }
      if (response.data.status === "ok") {
        return {
          status: "ok",
          message: "Thêm thành viên vào nhóm thành công.",
        };
      }
    } catch (error) {
      console.log("Không thể thêm thành viên vào nhóm: ", error);
      throw error;
    }
  },

  // Xóa thành viên khỏi nhóm / Rời nhóm
  removeMember: async ({ groupId, userId }) => {
    try {
      const response = await apiService.post(`/${PREFIX}/remove-member`, {
        groupId,
        userId,
      });
      if (response.data.status === "ok") {
        return {
          status: "ok",
          message: "Xóa thành viên khỏi nhóm thành công.",
        };
      }
    } catch (error) {
      console.log("Không thể xóa thành viên khỏi nhóm: ", error);
      throw error;
    }
  },

  // Chuyển quyền quản trị viên
  appointAdmin: async ({ groupId, newAdimUserId, userId }) => {
    try {
      // Chuyển quyền quản trị viên
      const changeAdmin = await apiService.put(
        `/${PREFIX}/transferAdmin/${groupId}/${newAdimUserId}`
      );

      // Cập nhật quyền của thành viên được chọn thành quản trị viên
      const setRoleNewAdmin = await apiService.put(
        `/${PREFIX}/${groupId}/members/${newAdimUserId}/role`,
        { role: "admin" }
      );

      // Cập nhật quyền của thành viên cũ thành thành viên thường
      const updateRoleOldAdmin = await apiService.put(
        `/${PREFIX}/${groupId}/members/${userId}/role`,
        { role: "member" }
      );

      if (
        changeAdmin.data.status === "ok" &&
        setRoleNewAdmin.data.status === "ok" &&
        updateRoleOldAdmin.data.status === "ok"
      ) {
        return {
          status: "ok",
          message: "Chuyển quyền quản trị viên thành công.",
        };
      }
    } catch (error) {
      console.log("Không thể chuyển quyền quản trị viên: ", error);
      throw error;
    }
  },

  // Kiểm tra trạng thái phê duyệt thành viên của nhóm
  checkMemberApproval: async (groupId) => {
    try {
      const response = await apiService.get(
        `/${PREFIX}/member-approval/${groupId}`
      );

      if (response.data.status === "error") {
        console.error("API trả về lỗi:", response.data.message);
        return false;
      }

      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái phê duyệt thành viên:", error);
      return false;
    }
  },

  // Cập nhật trạng thái phê duyệt thành viên của nhóm
  updateMemberApproval: async ({ groupId, requireApproval }) => {
    try {
      const response = await apiService.put(
        `/${PREFIX}/member-approval/${groupId}`,
        { requireApproval }
      );

      if (response.data.status === "error") {
        console.error("API trả về lỗi:", response.data.message);
        return null;
      }

      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái phê duyệt thành viên:", error);
      return null;
    }
  },

  // Lấy danh sách yêu cầu tham gia nhóm đang chờ duyệt
  getPendingMembers: async (groupId) => {
    try {
      const response = await apiService.get(
        `/${PREFIX}/pending-members/${groupId}`
      );

      if (response.data.status === "error") {
        console.error("API trả về lỗi:", response.data.message);
        return [];
      }

      return response.data.data || [];
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu cầu tham gia:", error);
      return [];
    }
  },

  // Lấy danh sách thành được mời bởi bạn
  getInvitedMembersByUserId: async (userId) => {
    try {
      const response = await apiService.get(
        `/${PREFIX}/invited-members/${userId}`
      );

      if (response.data.status === "error") {
        console.error("API trả về lỗi:", response.data.message);
        return [];
      }

      return response.data.data;
    } catch (error) {
      console.log("Không thể lấy danh sách thành viên được mời: ", error);
      return [];
    }
  },

  // Chấp nhận thành viên vào nhóm
  acceptMember: async ({ groupId, memberId }) => {
    try {
      const response = await apiService.put(
        `/${PREFIX}/accept-member/${groupId}/${memberId}`
      );

      if (response.data.status === "error") {
        console.error("API trả về lỗi:", response.data.message);
        return null;
      }

      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi chấp nhận thành viên:", error);
      return null;
    }
  },

  // Từ chối thành viên vào nhóm
  rejectMember: async ({ groupId, memberId }) => {
    try {
      const response = await apiService.put(
        `/${PREFIX}/reject-member/${groupId}/${memberId}`
      );

      if (response.data.status === "error") {
        console.error("API trả về lỗi:", response.data.message);
        return null;
      }

      return response.data.status;
    } catch (error) {
      console.error("Lỗi khi từ chối thành viên:", error);
      return null;
    }
  },
};

export default groupService;
