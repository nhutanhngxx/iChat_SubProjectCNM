import { apiService } from "./api";

const PREFIX = "friends";
const friendService = {
  getFriendListByUserId: async (userId) => {
    try {
      const response = await apiService.get(`/${PREFIX}/${userId}`);
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

  sendFriendRequest: async (senderId, receiverId) => {},

  acceptFriendRequest: async (requestId) => {},

  rejectFriendRequest: async (requestId) => {},

  cancelFriendRequest: async (requestId) => {},

  unfriendUser: async (friendId) => {},

  blockUser: async (userId) => {},

  unblockUser: async (userId) => {},

  getBlockedUsersByUserId: async (userId) => {},
};

export default friendService;
