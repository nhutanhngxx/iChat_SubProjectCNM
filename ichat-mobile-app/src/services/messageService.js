import api from "./api";

const messageService = {
  getMessagesByGroupId: async (user, chat) => {
    try {
      if (chat?.id && user?.id) {
        const response = await api.get(`/messages/${chat.id}`);
        if (response.data.status === "ok") return response.data.data;
      } else return;
    } catch (error) {
      console.log("Message Service Error: ", error);
      return [];
    }
  },
};

export default messageService;
