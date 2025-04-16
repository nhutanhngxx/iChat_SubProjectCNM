import { apiService } from "./api";

const PREFIX = "users";
const userService = {
  getUserById: async (userId) => {
    try {
      const response = await apiService.get(`/${PREFIX}/${userId}`);
      if (response.data.status === "error") {
        return null;
      }
      if (response.data.status === "ok") {
        return response.data.user;
      }
    } catch (error) {
      // console.error(
      //   "Lỗi: Không thể lấy được thông tin người dùng từ User Service:",
      //   error
      // );
      return null;
    }
  },

  getAllUser: async () => {
    try {
      const response = await apiService.get(`/${PREFIX}/`);
      if (response.data.status === "error") {
        return [];
      }
      if (response.data.status === "ok") {
        return response.data.users;
      }
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
