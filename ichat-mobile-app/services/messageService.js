import { apiService } from "./api";

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

  // Xóa tin nhắn giữa 2 người
  deleteChatHistory: async (userId, chatId) => {
    try {
      const response = await apiService.delete(
        `/${PREFIX}/${userId}/${chatId}`
      );
      if (response.data.status === "ok")
        return {
          status: response.data.status,
          message: response.data.message,
        };
      else
        return {
          status: response.data.status,
          message: response.data.message,
        };
    } catch (error) {
      console.log("Không thể xóa lịch sử trò chuyện: ", error);
      return {
        status: "error",
        message: "Không thể xóa lịch sử trò chuyện",
      };
    }
  },

  searchMessages: async (keyword, userId) => {
    try {
      if (!keyword || !userId) {
        throw new Error("Từ khóa tìm kiếm và ID người dùng là bắt buộc");
      }
      const response = await apiService.get(`/${PREFIX}/search/${userId}`, {
        params: { search: keyword },
      });

      if (response.data.status === "ok") {
        return {
          messages: response.data.messages || [],
          message: response.data.message || "",
        };
      }
      throw new Error(response.data.message || "Lỗi khi tìm kiếm tin nhắn");
    } catch (error) {
      console.log("Message Service Error: ", error);
      throw new Error(
        error.message || "Không thể tìm kiếm tin nhắn. Vui lòng thử lại."
      );
    }
  },

  replyMessage: async (message) => {
    try {
      const response = await apiService.post(`/${PREFIX}/reply`, message);
      return response.data;
    } catch (error) {
      console.log("Message Service Error: ", error);
      return null;
    }
  },

  // Thả reaction cho tin nhắn
  addReaction: async (messageId, userId, reactionType) => {
    try {
      const response = await apiService.post(
        `/${PREFIX}/${messageId}/reactions`,
        {
          user_id: userId,
          reaction_type: reactionType,
        }
      );
      return response.data;
    } catch (error) {
      console.log("Lỗi thả reaction tin nhắn ở Message Service: ", error);
      return null;
    }
  },
};

export default messageService;
