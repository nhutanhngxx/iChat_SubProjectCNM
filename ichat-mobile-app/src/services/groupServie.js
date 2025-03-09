import api from "./api";

// Tính thời gian
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi"; // Tiếng việt nè

dayjs.extend(relativeTime);
dayjs.locale("vi");

const getTimeAgo = (timestamp) => {
  return dayjs(timestamp).fromNow(); // Hiển thị "X phút trước"
};

const formatGroupList = (groups) => {
  if (!Array.isArray(groups)) return [];
  return groups.map((group) => ({
    id: group._id,
    name: group.name,
    avatar: group.avatar,
    lastMessage: group?.lastMessage || "Chưa có tin nhắn",
    messages: [],
    created_at: getTimeAgo(group.created_at),
    chatType: "group",
  }));
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
};

export default groupService;
