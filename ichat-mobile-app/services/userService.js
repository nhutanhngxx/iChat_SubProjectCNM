import api from "./api";

const userService = {
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.log("User Service Error: ", error);
      return null;
    }
  },
};

export default userService;
