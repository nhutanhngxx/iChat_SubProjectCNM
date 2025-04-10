import { apiService } from "../services/api";

const PREFIX = "messages";

const cardService = {
  createMessageCard: async ({ own_id, title, card_color }) => {
    try {
      const response = await apiService.post(`/${PREFIX}/message-cards`, {
        own_id,
        title,
        card_color,
      });
      if (response.data.status === "ok") return response.data.data;
      else {
        return response.data.message;
      }
    } catch (error) {
      console.log("Can not create message card: ", error);
    }
  },
  getMessageCardsByUserId: async (userId) => {
    try {
      const response = await apiService.get(`/message-cards/${userId}`);
      if (response.data.status === "ok") return response.data.data;
      else return [];
    } catch (error) {
      console.log("Can not get message cards: ", error);
      return [];
    }
  },
};

export default cardService;
