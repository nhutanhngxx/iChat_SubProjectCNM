import api from "./api";
import { auth } from "../config/firebase";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";

const registerService = {
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
      const response = await api.post("/auth/check-existed-phone", { phone });
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
      const response = await api.post("/auth/register", {
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

export default registerService;
