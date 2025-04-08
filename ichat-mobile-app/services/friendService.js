import api from "./api";

const friendService = {
  getFriendListByUserId: async (userId) => {
    try {
      const response = await api.get(`/friends/${userId}`);
      return response.data.friends;
    } catch (error) {
      console.log("Friend Service Error: ", error);
      return [];
    }
  },

  getFriendRequestByUserId: async (userId) => {
    try {
    } catch (error) {
      console.log("Friend Service Error: ", error);
      return [];
    }
  },
};

export default friendService;
