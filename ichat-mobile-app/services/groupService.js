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

// Format danh sách nhóm để hiển thị trên component Chatting
const formatGroupList = async (groups) => {
  if (!Array.isArray(groups)) {
    return [];
  }
  // Gọi fetchMessages() song song để lấy tin nhắn
  await Promise.all(
    groups.map(async (group) => {
      const messages = await messageService.getMessagesByGroupId(group._id);
      if (messages && messages.length > 0) {
        group.lastMessage = messages[messages.length - 1];
      }
    })
  );

  return groups.map((group) => {
    const lastMessageTime = new Date(group.lastMessage.timestamp).getTime();
    return {
      id: group._id,
      name: group.name,
      avatar: {
        uri: group.avatar || "https://i.ibb.co/9k8sPRMx/best-seller.png",
      },
      lastMessage:
        group?.lastMessage.type === "image"
          ? "[Hình ảnh]"
          : group.lastMessage.content,
      lastMessageTime: lastMessageTime,
      time: getTimeAgo(lastMessageTime),
      chatType: "group",
    };
  });
};

const PREFIX = "groups";
const groupService = {
  getAllGroupsByUserId: async (userId) => {
    try {
      const response = await apiService.get(`/${PREFIX}/${userId}`);
      return formatGroupList(response.data);
    } catch (error) {
      console.log("Group Service Error: ", error);
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

  getGroupById: async (groupId) => {},

  createGroup: async () => {},
};

export default groupService;
