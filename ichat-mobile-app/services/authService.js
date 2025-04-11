import { apiService } from "./api";
import { auth } from "../config/firebase";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("+84")) return cleaned;
  if (cleaned.startsWith("0")) return "+84" + cleaned.slice(1);
  if (cleaned.startsWith("84")) return "+84" + cleaned.slice(2);
  return "+84" + cleaned;
};

const PREFIX = "auth";
const authService = {
  login: async ({ phone, password }) => {
    try {
      const formattedPhone = phone.startsWith("0")
        ? phone.replace(/^0/, "+84")
        : `+84${phone}`;

      const response = await apiService.post(`/${PREFIX}/login`, {
        phone: formattedPhone,
        password,
      });

      if (response.data.status === "ok") {
        // return response.data;
        const { accessToken, user } = response.data;
        await AsyncStorage.setItem("token", accessToken);
        await AsyncStorage.setItem("user", JSON.stringify(user));
        return { user };
      } else return response.data.message;
    } catch (error) {
      console.log("Login Service Error: ", error);
      return {
        status: "error",
        message:
          error.response?.data?.message || "Không thể đăng nhập tài khoản",
      };
    }
  },

  checkPassword: async ({ phone, password }) => {
    try {
      const response = await apiService.post(`/${PREFIX}/verify-password`, {
        phone,
        password,
      });
      return response.data.isValid === true;
    } catch (error) {
      return false;
    }
  },

  logout: async (userId) => {
    try {
      await apiService.post(`/${PREFIX}/logout`, { userId });
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.log("Logout Service Error: ", error);
      return {
        status: "error",
        message:
          error.response?.data?.message || "Không thể đăng xuất tài khoản",
      };
    }
  },

  sendOTPWithoutCheck: async (phone, recaptchaVerifier) => {
    try {
      phone = formatPhoneNumber(phone);
      console.log("Formatted phone:", phone);

      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phone,
        recaptchaVerifier.current
      );

      return {
        status: "ok",
        verificationId: verificationId,
        phoneNumber: phone,
      };
    } catch (error) {
      console.log("OTP Error:", error);
      return {
        status: "error",
        message: "Không thể gửi mã OTP",
      };
    }
  },

  checkExistedPhone: async (phone) => {
    if (!phone) {
      return {
        result: true,
        message: "Vui lòng nhập số điện thoại",
      };
    }
    try {
      const response = await apiService.post(`/${PREFIX}/check-existed-phone`, {
        phone,
      });

      if (response.data.status === "error") {
        return {
          result: false,
          message: "Số điện thoại đã tồn tại",
        };
      } else
        return {
          result: true,
          message: "Số điện thoại chưa tồn tại",
        };
    } catch (error) {
      console.log("Cannot check existed phone: ", error);
      if (error.response?.status === 400) {
        return {
          result: false,
          message: error.response?.data?.message,
        };
      }
      return true;
    }
  },

  sendOTP: async (phone, recaptchaVerifier) => {
    try {
      if (!phone) {
        return {
          status: "error",
          message: "Vui lòng nhập số điện thoại",
        };
      }

      phone = "+84" + phone.replace(/^(0|84)/, "");

      const phoneProvider = new PhoneAuthProvider(auth);
      console.log(phoneProvider);

      const verificationId = await phoneProvider.verifyPhoneNumber(
        phone,
        recaptchaVerifier.current
      );

      console.log("Verification ID: ", recaptchaVerifier);
      return {
        status: "ok",
        verificationId: verificationId,
        phoneNumber: phone,
      };
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

  validateOTP: async (phone, otp, verificationId) => {
    try {
      if (!phone || !otp) {
        return {
          status: "error",
          message: "Số điện thoại và mã OTP không được để trống",
        };
      }

      console.log(`Verifying OTP: ${otp} for phone: ${phone}`);

      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await signInWithCredential(auth, credential);

      console.log("User credential: ", userCredential);

      return {
        status: "ok",
        data: userCredential,
        message: "Xác thực thành công",
      };
    } catch (error) {
      console.error("Error during sign-in:", error);
      let errorMessage;
      switch (error.code) {
        case "auth/invalid-verification-code":
          errorMessage = "Mã OTP không hợp lệ. Vui lòng thử lại.";
          break;
        case "auth/invalid-verification-id":
          errorMessage = "ID xác minh không hợp lệ.";
          break;
        default:
          errorMessage = "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.";
          break;
      }

      return {
        status: "error",
        message: errorMessage,
      };
    }
  },

  register: async (tempToken, phone, password, fullName, dob, gender) => {
    try {
      if (!tempToken || !phone || !password || !fullName || !dob || !gender) {
        return {
          status: "error",
          message: "Thiếu thông tin đăng ký",
        };
      }
      const response = await apiService.post(`/${PREFIX}/register`, {
        tempToken,
        phone,
        password,
        fullName,
        dob,
        gender,
      });
      console.log("Register Service Response: ", response.data);

      return response.data;
    } catch (error) {
      console.error("Register Service Error: ", error);
      return {
        status: "error",
        message: error.response?.data?.message || "Không thể đăng ký tài khoản",
      };
    }
  },

  resetPassword: async (phone) => {},

  changePassword: async ({
    userId,
    currentPassword,
    newPassword,
    confirmPassword,
  }) => {
    if (newPassword.length < 6) {
      return {
        status: "error",
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      };
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        status: "error",
        message: "Vui lòng nhập đầy đủ thông tin.",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        status: "error",
        message: "Mật khẩu mới không trùng khớp.",
      };
    }
    try {
      const response = await apiService.put(`/${PREFIX}/change-password`, {
        userId,
        currentPassword,
        newPassword,
      });
      if (response.data.status === "ok") {
        return {
          status: "ok",
          message: response.data.message,
        };
      } else {
        return {
          status: "error",
          message: response.data.message,
        };
      }
    } catch (error) {
      console.log("Change Password Service Error: ", error);
      return {
        status: "error",
        message:
          error.response?.data?.message || "Không thể đổi mật khẩu tài khoản",
      };
    }
  },

  changePhoneNumber: async ({}) => {},

  changeInformation: async ({}) => {},

  changePhone: async (userId, newPhone) => {
    try {
      const response = await apiService.put(`/${PREFIX}/update-phone`, {
        userId,
        newPhone,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật số điện thoại:", error);
      throw error;
    }
  },
};

export default authService;
