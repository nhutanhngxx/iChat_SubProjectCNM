import { apiService } from "./api";

const PREFIX = "friendships";
const friendService = {
  // Lấy danh sách bạn bè của người dùng
  getFriendListByUserId: async (userId) => {
    try {
      const response = await apiService.get(`/${PREFIX}/${userId}`);
      return response.data.friends;
    } catch (error) {
      // console.log("Friend Service Error: ", error);
      return [];
    }
  },

  // Lấy danh sách lời mời kết bạn đã gửi đến người dùng
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

  // Lấy danh sách lời mời kết bạn đã gửi đi của người dùng
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

  // Gửi lời mời kết bạn
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
      return { status: "error", message: "Đã xảy ra lỗi" };
    }
  },

  // Đồng ý lời mời kết bạn
  acceptFriendRequest: async (requestId) => {},

  // Từ chối lời mời kết bạn
  rejectFriendRequest: async (requestId) => {},

  // Hủy/thu hồi lời mời kết bạn
  cancelFriendRequest: async (requestId) => {},

  // Hủy kết bạn
  unfriendUser: async (friendId) => {},

  // Chặn người dùng
  blockUser: async (userId) => {},

  // Hủy chặn người dùng
  unblockUser: async (userId) => {},

  // Lấy danh sách người dùng bị chặn
  getBlockedUsersByUserId: async (userId) => {},
};

export default friendService;
