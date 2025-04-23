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
      return response.data.data;
    } catch (error) {
      console.log("Group Service Error: ", error);
      return [];
    }
  },

  createGroup: async ({ groupName, adminId, participantIds }) => {
    console.log("Group Service: ", groupName, adminId, participantIds);
    try {
      const response = await apiService.post(`/${PREFIX}/`, {
        name: groupName,
        admin_id: adminId,
        participant_ids: participantIds,
      });
      if (response.data.status === "error") {
        throw new Error(response.data.message);
      }
      console.log("Tạo nhóm thành công:", response.data);
      return response.data;
    } catch (error) {
      console.log("Không thể tạo nhóm: ", error);
      throw error;
    }
  },

  deleteGroup: async (groupId) => {
    try {
      const response = await apiService.delete(`/${PREFIX}/${groupId}`);
      if (response.data.status === "error") {
        throw new Error(response.data.message);
      }
      if (response.data.status === "ok") {
        console.log("Xóa nhóm thành công:", response.data);
        return { status: "ok", message: "Xóa nhóm thàn công." };
      }
    } catch (error) {
      console.log("Không thể xóa nhóm: ", error);
      throw error;
    }
  },

  renameGroup: async ({ groupId, name }) => {
    try {
      // console.log("Group Service: ", groupId, newName);
      const response = await apiService.put(`/${PREFIX}/${groupId}`, {
        name,
      });
      console.log("response: ", response.data);

      if (response.data.status === "error") {
        throw new Error(response.data.message);
      }
      if (response.data.status === "ok") {
        console.log("Đổi tên nhóm thành công:", response.data);
        return { status: "ok", message: "Đổi tên nhóm thành công." };
      }
    } catch (error) {
      console.log("Không thể đổi tên nhóm: ", error);
      throw error;
    }
  },

  addMember: async ({ groupId, userIds }) => {
    try {
      const response = await apiService.post(`/${PREFIX}/add-members`, {
        groupId,
        userIds,
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
};

export default groupService;
