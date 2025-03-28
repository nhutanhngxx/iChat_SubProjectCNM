import api from "./api";
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

const formatChatList = (messages, allUser) => {
  if (!Array.isArray(messages)) return [];
  const chatMap = new Map();
  messages.forEach((msg) => {
    if (msg.chat_type === "private") {
      const chatUserId =
        msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      const chatUser = allUser.find((u) => u._id === chatUserId);
      const fullName = chatUser ? chatUser.full_name : "Người dùng ẩn danh";
      const avatarPath =
        chatUser?.avatar_path || "https://i.ibb.co/9k8sPRMx/best-seller.png";
      const lastMessageTime = new Date(msg.timestamp).getTime();
      const timeDiff = getTimeAgo(lastMessageTime);
      if (
        !chatMap.has(chatUserId) ||
        lastMessageTime > chatMap.get(chatUserId).lastMessageTime
      ) {
        chatMap.set(chatUserId, {
          id: chatUserId,
          name: fullName,
          lastMessage: msg.type === "image" ? "[Hình ảnh]" : msg.content,
          lastMessageTime: lastMessageTime,
          time: timeDiff,
          avatar: { uri: avatarPath },
        });
      }
    } else return;
  });

  // return Array.from(chatMap.values());
  return Array.from(chatMap.values()).sort(
    (a, b) => b.lastMessageTime - a.lastMessageTime
  );
};

const privateService = {};

export default privateService;
