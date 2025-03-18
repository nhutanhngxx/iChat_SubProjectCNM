import api from "./api";

const registerService = {
  sendOTP: async (phone) => {
    try {
      if (phone) {
        const response = await api.post("/auth/send-otp", { phone });
        if (response.data.status === "ok") return response.data;
      } else return;
    } catch (error) {
      console.log("Register Service Error: ", error);
      if (error.response?.status === 400) {
        return {
          status: "error",
          message:
            error.response.data?.message ||
            "Số điện thoại không hợp lệ hoặc đã tồn tại",
        };
      }

      return {
        status: "error",
        message: error.response?.data?.message || "Không thể gửi mã OTP",
      };
    }
  },
};

export default registerService;
