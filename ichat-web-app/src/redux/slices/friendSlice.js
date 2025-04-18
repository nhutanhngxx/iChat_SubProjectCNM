import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `http://${window.location.hostname}:5001/api/friendships`;

// Lấy danh sách chặn
export const getBlockedUsers = createAsyncThunk(
  "friend/getBlockedUsers",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/blocked-users/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Lấy danh sách bạn bè
export const getUserFriends = createAsyncThunk(
  "friend/getUserFriends",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

//Lấy danh sách lời mời kết bạn đã nhận
export const getReceivedFriendRequests = createAsyncThunk(
  "friend/getReceivedFriendRequests",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/received-requests/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

//Lấy danh sách lời mời kết bạn đã gửi
export const getSentFriendRequests = createAsyncThunk(
  "friend/getSentFriendRequests",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/sent-requests/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Gửi lời mời kết bạn
export const sendFriendRequest = createAsyncThunk(
  "friend/sendFriendRequest",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/send-friend-request`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Chấp nhận lời mời kết bạn
export const acceptFriendRequest = createAsyncThunk(
  "friend/acceptFriendRequest",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/accept-friend-request`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Hủy lời mời kết bạn
export const cancelFriendRequest = createAsyncThunk(
  "friend/cancelFriendRequest",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/cancel-friend-request`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Chặn người dùng
export const blockUser = createAsyncThunk(
  "friend/blockUser",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/block-user`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Hủy chặn người dùng
export const unblockUser = createAsyncThunk(
  "friend/unblockUser",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/unblock-user`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Hủy kết bạn
export const unfriendUser = createAsyncThunk(
  "friend/unfriendUser",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/unfriend`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Gợi ý kết bạn
export const getFriendSuggestions = createAsyncThunk(
  "friend/getFriendSuggestions",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/friend-suggestions/${userId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Đếm số bạn chung
export const countMutualFriends = createAsyncThunk(
  "friend/countMutualFriends",
  async ({ user1Id, user2Id }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/mutual-friends/${user1Id}/${user2Id}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const friendSlice = createSlice({
  name: "friend",
  initialState: {
    friends: [],
    suggestions: [],
    mutualCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    resetFriendError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Thêm cases mới cho getReceivedFriendRequests
      .addCase(getReceivedFriendRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReceivedFriendRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.receivedRequests = action.payload.friendRequests;
      })
      .addCase(getReceivedFriendRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Thêm cases mới cho getSentFriendRequests
      .addCase(getSentFriendRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSentFriendRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.sentRequests = action.payload.friendRequests;
      })
      .addCase(getSentFriendRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Giữ nguyên các cases khác
      .addCase(getUserFriends.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload;
      })
      .addCase(getUserFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get friend suggestions
      .addCase(getFriendSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      })

      // Count mutual friends
      .addCase(countMutualFriends.fulfilled, (state, action) => {
        state.mutualCount = action.payload.count || 0;
      })

      // Handle actions (send, accept, cancel, block, unfriend)
      .addMatcher(
        (action) =>
          action.type.startsWith("friend/") &&
          ["pending", "fulfilled", "rejected"].some((s) =>
            action.type.endsWith(s)
          ),
        (state, action) => {
          if (action.type.endsWith("pending")) {
            state.loading = true;
            state.error = null;
          } else if (action.type.endsWith("fulfilled")) {
            state.loading = false;
          } else if (action.type.endsWith("rejected")) {
            state.loading = false;
            state.error = action.payload;
          }
        }
      );
  },
});

export const { resetFriendError } = friendSlice.actions;
export default friendSlice.reducer;
