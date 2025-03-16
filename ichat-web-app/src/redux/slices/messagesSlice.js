import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const API_URL = "http://localhost:5001/messages/";
const API_URL = `http://${window.location.hostname}:5001//`;

// Lấy danh sách người nhận gần nhất
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (id) => {
    const response = await fetch(`${API_URL}recent-receivers/${id}`);
    const data = await response.json();
    return data.data;
  }
);

// Lấy tin nhắn giữa sender và receiver
export const fetchChatMessages = createAsyncThunk(
  "messages/fetchChatMessages",
  async ({ senderId, receiverId }) => {
    const response = await fetch(
      `${API_URL}messages/${senderId}/${receiverId}`
    );
    const data = await response.json();
    return data.data;
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    messages: [],
    chatMessages: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    chatStatus: "idle",
    error: null,
  },
  reducers: {
    // Thêm reducer để cập nhật tin nhắn
    updateMessages: (state, action) => {
      const newMessage = action.payload;
      state.chatMessages.push(newMessage); // Thêm tin nhắn mới vào danh sách chatMessages
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchChatMessages.pending, (state) => {
        state.chatStatus = "loading";
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.chatStatus = "succeeded";
        state.chatMessages = action.payload;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.chatStatus = "failed";
        state.error = action.error.message;
      });
  },
});

// Export action creator
export const { updateMessages } = messagesSlice.actions;

export default messagesSlice.reducer;
