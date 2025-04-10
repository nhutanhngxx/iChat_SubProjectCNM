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
  // Đăng nhập
  login: async ({ phone, password }) => {
    try {
      const formattedPhone = phone.startsWith("0")
        ? phone.replace(/^0/, "+84")
        : `+84${phone}`;

      const response = await apiService.post(`/login`, {
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

  // Đăng xuất
  logout: async (userId) => {
    try {
      await apiService.post(`/logout`, { userId });
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

  sendOTP: async (phone, recaptchaVerifier) => {
    try {
      if (!phone) {
        return {
          status: "error",
          message: "Vui lòng nhập số điện thoại",
        };
      }

      phone = "+84" + phone.replace(/^(0|84)/, "");

      // Check if phone number is existed
      const response = await apiService.post(`/${PREFIX}/check-existed-phone`, {
        phone,
      });
      if (response.data.status !== "ok") {
        return {
          status: "error",
          message: response.data.message,
        };
      }

      // Use PhoneAuthProvider with recaptcha verifier
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phone,
        recaptchaVerifier.current
      );

      console.log("Verification ID: ", verificationId);
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
};

export default authService;
