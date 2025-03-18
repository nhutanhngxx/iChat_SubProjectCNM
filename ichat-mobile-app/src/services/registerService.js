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
  validateOTP: async (phone, otp) => {
    try {
      if (!phone || !otp) {
        return {
          status: "error",
          message: "Số điện thoại và mã OTP không được để trống",
        };
      }

      console.log(`Verifying OTP: ${otp} for phone: ${phone}`);

      const otpString = String(otp).trim();

      const response = await api.post("/auth/verify-otp", {
        phone,
        otp: otpString,
      });

      console.log("OTP verification response:", response.data);
      return response.data;
    } catch (error) {
      console.error("OTP verification error details:", error.response?.data);
      //   Thêm phần xử lý lỗi ở đây
      return {
        status: "error",
        message: error.response?.data?.message || "Không thể xác thực OTP",
      };
    }
  },
};

export default registerService;
