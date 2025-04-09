import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const API_URL = `http://${window.location.hostname}:5001/`;
// Định nghĩa action async để đăng nhập
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ phone, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}login`, {
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
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}logout`, {
        method: "POST",
        credentials: "include", // Gửi cookie chứa refreshToken nếu có
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


const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
  },
  reducers: {},
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
      });

  },
});

export default authSlice.reducer;
