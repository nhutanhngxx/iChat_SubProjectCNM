import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const API_URL = `http://${window.location.hostname}:5001/api/users`;
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
const API_URL = `${REACT_APP_API_URL}/api/users`;
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
// Updated thunk with proper parameters
export const searchUsersPhone = createAsyncThunk(
  "user/searchUsersByPhone",
  async ({ query, searchType, exactMatch = false }, { rejectWithValue }) => {
    try {
      // Pass all parameters properly to the API
      const res = await axios.get(`${API_URL}/search`, {
        params: {
          query: encodeURIComponent(query),
          searchType,
          exactMatch: searchType === "phone" ? exactMatch : undefined,
        },
      });
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
    // Add these new state properties
    searchResults: [],
    searchLoading: false,
    searchError: null,
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
      })
      // Add cases for searchUsersByPhone
      .addCase(searchUsersPhone.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchUsersPhone.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsersPhone.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload?.message || "Tìm kiếm thất bại";
      });
  },
});

export const { setUser: setUserRedux } = userSlice.actions;
export default userSlice.reducer;
