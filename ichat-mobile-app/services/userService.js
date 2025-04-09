import { apiService } from "./api";

const PREFIX = "users";
const userService = {
  getUserById: async (userId) => {
    try {
      const response = await apiService.get(`/${PREFIX}/${userId}`);
      return response.data;
    } catch (error) {
      console.log("User Service Error: ", error);
      return null;
    }
  },

  getAllUser: async () => {
    try {
      const response = await apiService.get(`/${PREFIX}`);
      return response.data.users;
    } catch (error) {
      console.log("User Service Error: ", error);
      return [];
    }
  },
};

export default userService;
