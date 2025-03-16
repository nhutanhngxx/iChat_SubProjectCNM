import api from "./api";
import messageService from "./messageService";
import userService from "./userService";

// Tính thời gian
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi"; // Tiếng việt nè
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

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

const groupService = {
  getAllGroupsByUserId: async (userId) => {
    try {
      const response = await api.get(`/groups/${userId}`);
      return formatGroupList(response.data);
    } catch (error) {
      console.log("Group Service Error: ", error);
      return [];
    }
  },
  getGroupMembers: async (groupId) => {
    try {
      const members = await api.get(`/groups/${groupId}/members`);
      return members.data.data;
    } catch (error) {
      console.log("Group Service Error: ", error);
      return [];
    }
  },
};

export default groupService;
