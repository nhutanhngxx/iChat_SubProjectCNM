import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {auth, RecaptchaVerifier,signInWithPhoneNumber} from "../../firebase/config"; // Import firebase auth and RecaptchaVerifier
import axios from "axios";
const API_URL = `http://${window.location.hostname}:5001/api/`;
// Định nghĩa action async để đăng nhập
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ phone, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // Lưu token vào localStorage để duy trì đăng nhập
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action async để logout (gọi API logout)
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Gửi cookie chứa refreshToken nếu có
        body: JSON.stringify({ userId }), // <-- truyền userId ở đây
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng xuất thất bại");
      }

      return data;
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Action async để xác thực người dùng với token
export const authenticateWithToken = createAsyncThunk(
  "auth/authenticateWithToken",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}auth/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Token không hợp lệ");
      }

      // Lưu user vào localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      return { user: data.user, token };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const checkExistedPhone = createAsyncThunk(
  "auth/checkExistedPhone",
  async (phone, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}auth/check-existed-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Kiểm tra số điện thoại thất bại");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// CHangePassword
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ userId, currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");    

      const response = await fetch(`${API_URL}auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đổi mật khẩu thất bại");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// Gửi OTP bằng Firebase
// In your authSlice.js
export const sendOtpFirebase = createAsyncThunk(
  'auth/sendOtpFirebase',
  async (phoneNumber, { rejectWithValue }) => {
    try {
      // Clear any existing reCAPTCHA
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.error("Error clearing existing reCAPTCHA:", e);
        }
        window.recaptchaVerifier = null;
      }
      // // Clear the container element
      // const recaptchaContainer = document.getElementById('recaptcha-container');
      // if (recaptchaContainer) {
      //   recaptchaContainer.innerHTML = '';
      // }
   

      // Important: Ensure auth is properly initialized
      if (!auth || !auth.app) {
        throw new Error("Firebase auth is not properly initialized");
      }

      if(!window.recaptchaVerifier) {
      }
      // Create new reCAPTCHA verifier
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log("reCAPTCHA verified");
        }
      });
      
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;

      return confirmationResult.verificationId;
    } catch (error) {
      console.error("Firebase OTP error:", error);
      return rejectWithValue(error.message || "Failed to send OTP");
    }
  }
);
// export const sendOtpFirebase = createAsyncThunk(
//   'auth/sendOtpFirebase',
//   async (phoneNumber, { rejectWithValue }) => {
//     try {
//       // 1. Ensure phone number format
//       if (!phoneNumber.startsWith('+')) {
//         phoneNumber = '+' + phoneNumber;
//       }
      
//       // 2. Check for existing recaptchaVerifier and clear it
//       if (window.recaptchaVerifier) {
//         try {
//           window.recaptchaVerifier.clear();
//         } catch (e) {
//           console.error("Error clearing existing reCAPTCHA:", e);
//         }
//         window.recaptchaVerifier = null;
//       }
      
//       // 3. Check for container and create it if it doesn't exist
//       let recaptchaContainer = document.getElementById('recaptcha-container');
//       if (!recaptchaContainer) {
//         console.log("Creating recaptcha container");
//         recaptchaContainer = document.createElement('div');
//         recaptchaContainer.id = 'recaptcha-container';
//         document.body.appendChild(recaptchaContainer);
//       } else {
//         // Clear container but don't remove it
//         recaptchaContainer.innerHTML = '';
//       }
      
//       // 4. Ensure auth is properly initialized
//       if (!auth || !auth.app) {
//         throw new Error("Firebase auth is not properly initialized");
//       }
      
//       // 5. Add a small delay to ensure DOM is ready
//       await new Promise(resolve => setTimeout(resolve, 100));
      
//       // 6. Create reCAPTCHA verifier with proper error handling
//       console.log("Creating new reCAPTCHA verifier");
//       window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
//         size: 'invisible',
//         callback: () => {
//           console.log("reCAPTCHA verified successfully");
//         },
//         'expired-callback': () => {
//           console.log("reCAPTCHA expired");
//         }
//       });
      
//       // 7. Send verification code
//       console.log("Sending verification code to:", phoneNumber);
//       const appVerifier = window.recaptchaVerifier;
//       const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
//       window.confirmationResult = confirmationResult;
      
//       return confirmationResult.verificationId;
//     } catch (error) {
//       console.error("Firebase OTP error:", error);
//       return rejectWithValue(error.message || "Failed to send OTP");
//     }
//   }
// );

// Xác minh OTP
export const verifyOtpFirebase = createAsyncThunk('auth/verifyOtpFirebase', async (otp, thunkAPI) => {
  try {
    const confirmationResult = window.confirmationResult;
    if (!confirmationResult) throw new Error('Không có kết quả xác thực');
    await confirmationResult.confirm(otp);
    return { verified: true };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Đặt lại mật khẩu
export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ phone, newPassword }, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}auth/reset-password`, { phone, newPassword });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || 'Đặt lại mật khẩu thất bại');
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
    phoneCheck: {
      loading: false,
      exists: false,
      error: null,
    },
    successMessage: null,
    otpSent: false,
    otpVerified: false,
    passwordResetSuccess: false,
  },
  reducers: {
    clearAuthError(state) {
      state.error = null;
      state.phoneCheck.error = null;
    },
    clearPhoneCheckStatus(state) {
      state.phoneCheck.exists = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(authenticateWithToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authenticateWithToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(authenticateWithToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.token = null;
        state.user = null;
      })
      .addCase(checkExistedPhone.pending, (state) => {
        if (!state.phoneCheck) state.phoneCheck = { loading: false, exists: false, error: null };
        state.phoneCheck.loading = true;
        state.phoneCheck.error = null;
        state.phoneCheck.exists = false;
      })
      .addCase(checkExistedPhone.fulfilled, (state, action) => {
        state.phoneCheck.loading = false;
        state.phoneCheck.exists = false; // Vì BE trả về "chưa tồn tại", nên exists = false
      })
      .addCase(checkExistedPhone.rejected, (state, action) => {
        state.phoneCheck.loading = false;
      
        // Nếu lỗi là "số đã tồn tại", thì exists = true
        if (
          action.payload === "Số điện thoại này đã được đăng ký."
        ) {
          state.phoneCheck.exists = true;
        } else {
          state.phoneCheck.error = action.payload;
        }
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        // Nếu muốn hiển thị thông báo đổi mật khẩu thành công thì lưu message vào state:
        state.successMessage = action.payload.message;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendOtpFirebase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtpFirebase.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(sendOtpFirebase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(verifyOtpFirebase.fulfilled, (state) => {
        state.otpVerified = true;
      })
      .addCase(verifyOtpFirebase.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(resetPassword.fulfilled, (state) => {
        state.passwordResetSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = action.payload;
      });
      

  },
});
export const { clearAuthError, clearPhoneCheckStatus,resetSuccessMessage  } = authSlice.actions;


export default authSlice.reducer;
