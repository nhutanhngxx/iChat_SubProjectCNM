import { apiService } from "./api";

const PREFIX = "users";
const userService = {
  getUserById: async (userId) => {
    try {
      const response = await apiService.get(`/${PREFIX}/${userId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi: Không thể lấy được thông tin người dùng từ User Service:",
        error
      );
      return null;
    }
  },

  getAllUser: async () => {
    try {
      const response = await apiService.get(`/${PREFIX}/`);
      return response.data.users;
    } catch (error) {
      console.log(
        "Lỗi: Không thể lấy được danh sách người dùng từ User Service: ",
        error
      );
      return [];
    }
  },
};

export default userService;
