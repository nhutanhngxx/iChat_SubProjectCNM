import { useContext } from "react";
import { apiService } from "./api";
import { UserContext } from "../context/UserContext";
const PREFIX = "messages";

const messageService = {
  // Lấy danh sách tin nhắn của một người dùng
  getMessagesByUserId: async (userId) => {
    try {
      if (userId) {
        const response = await apiService.get(`/${PREFIX}/${userId}`);
        if (response.data.status === "ok") {
          return response.data.data;
        }
      } else return;
    } catch (error) {
      console.log("Message Service Error: ", error);
      return [];
    }
  },

  // Lấy danh sách tin nhắn của một nhóm
  getMessagesByGroupId: async (chatId) => {
    try {
      if (chatId) {
        const response = await apiService.get(`/${PREFIX}/${chatId}`);
        if (response.data.status === "ok") return response.data.data;
      } else return;
    } catch (error) {
      console.log("Message Service Error: ", error);
      return [];
    }
  },

  // Lấy danh sách tin nhắn cá nhân 1-1
  getPrivateMessages: async ({ userId, chatId }) => {
    try {
      const response = await apiService.get(`/${PREFIX}/${userId}/${chatId}`);
      if (response.data.status === "ok") return response.data.data;
      else return;
    } catch (error) {
      console.log("Message Service Error: ", error);
      return [];
    }
  },

  // Update trạng thái tin nhắn đã đọc
  updateMessagesViewedStatus: async ({ receiverId, senderId }) => {
    try {
      const response = await apiService.put(`/${PREFIX}/viewed`, {
        receiverId,
        senderId,
      });
      return response;
    } catch (error) {
      console.log("Message Service Error: ", error);
    }
  },

  // Gửi tin nhắn
  sendMessage: async (message) => {},

  // Thu hồi tin nhắn
  recallMessage: async (messageId) => {},
};

export default messageService;
