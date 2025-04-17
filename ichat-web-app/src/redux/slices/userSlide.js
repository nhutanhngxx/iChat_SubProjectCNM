import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `http://${window.location.hostname}:5001/api/users`;

export const searchUsersByPhone = createAsyncThunk(
  "user/searchUsersByPhone",
  async (phone, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}?search=${encodeURIComponent(phone)}`
      );
      return res.data.users;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk để cập nhật thông tin người dùng
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/update/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data; // Dữ liệu người dùng đã cập nhật
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.userInfo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = {
          ...state.userInfo,
          ...action.payload,
        };
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Cập nhật thất bại";
      });
  },
});

export const { setUser: setUserRedux } = userSlice.actions;
export default userSlice.reducer;
