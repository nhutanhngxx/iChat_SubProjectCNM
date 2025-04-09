import { apiService } from "./api";

const friendService = {
  getFriendListByUserId: async (userId) => {
    try {
      const response = await apiService.get(`/friends/${userId}`);
      return response.data.friends;
    } catch (error) {
      console.log("Friend Service Error: ", error);
      return [];
    }
  },

  getReceivedRequestsByUserId: async (userId) => {
    try {
      const response = await apiService.get(`/received-requests/${userId}`);
      return response.data.friendRequests;
    } catch (error) {
      console.log("Friend Service Error: ", error);
      return [];
    }
  },

  getSentRequestsByUserId: async (userId) => {
    try {
      const response = await apiService.get(`/sent-requests/${userId}`);
      return response.data.friendRequests;
    } catch (error) {
      console.log("Friend Service Error: ", error);
      return [];
    }
  },
};

export default friendService;
