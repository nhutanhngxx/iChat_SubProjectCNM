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

  createGroup: async () => {},
};

export default groupService;
