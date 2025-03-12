import api from "./api";

const messageService = {
  getMessagesByGroupId: async (chatId) => {
    try {
      if (chatId) {
        const response = await api.get(`/messages/${chatId}`);
        if (response.data.status === "ok") return response.data.data;
      } else return;
    } catch (error) {
      console.log("Message Service Error: ", error);
      return [];
    }
  },
};

export default messageService;
