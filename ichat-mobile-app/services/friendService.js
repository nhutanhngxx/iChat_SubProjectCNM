import { apiService } from "./api";

const PREFIX = "friendships";
const friendService = {
  getFriendListByUserId: async (userId) => {
    try {
      const response = await apiService.get(`/${PREFIX}/${userId}`);
      return response.data.friends;
    } catch (error) {
      // console.log("Friend Service Error: ", error);
      return [];
    }
  },

  getReceivedRequestsByUserId: async (userId) => {
    try {
      const response = await apiService.get(
        `/${PREFIX}/received-requests/${userId}`
      );
      return response.data.friendRequests;
    } catch (error) {
      // console.log("Friend Service Error: ", error);
      return [];
    }
  },

  getSentRequestsByUserId: async (userId) => {
    try {
      const response = await apiService.get(
        `/${PREFIX}/sent-requests/${userId}`
      );
      return response.data.friendRequests;
    } catch (error) {
      // console.log("Friend Service Error: ", error);
      return [];
    }
  },

  sendFriendRequest: async ({ senderId, receiverId }) => {
    try {
      const response = await apiService.post(`/${PREFIX}/send-friend-request`, {
        senderId,
        receiverId,
      });
      if (response.data.status === "error") {
        return { status: "error", message: response.data.message };
      }
      if (response.data.status === "ok") {
        return { status: "ok", message: response.data.message };
      }
      return response.data;
    } catch (error) {
      console.log("Không thể gửi lời mời kết bạn: ", error);
      return {
        status: "error",
        message: "Đã xảy ra lỗi khi gửi lời mời kết bạn",
      };
    }
  },

  acceptFriendRequest: async (requestId) => {},

  rejectFriendRequest: async (requestId) => {},

  cancelFriendRequest: async (requestId) => {},

  unfriendUser: async (friendId) => {},

  blockUser: async (userId) => {},

  unblockUser: async (userId) => {},

  getBlockedUsersByUserId: async (userId) => {},
};

export default friendService;
