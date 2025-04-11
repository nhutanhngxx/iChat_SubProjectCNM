import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const API_URL = "http://localhost:5001/messages/";
const API_URL = `http://${window.location.hostname}:5001/api/messages/`;

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
      `${API_URL}${senderId}/${receiverId}`
    );
    const data = await response.json();
    return data.data;
  }
);
// Gửi tin nhắn
export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue({ error: "Network error" });
    }
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
      })
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(sendMessage.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.messages.push(action.payload.data);
      // })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const newMessage = action.payload.data;

        // Kiểm tra xem receiver đã có trong danh sách chưa
        const existingReceiver = state.messages.find(
          (msg) => msg.receiver_id === newMessage.receiver_id
        );

        if (!existingReceiver) {
          state.messages.unshift({
            receiver_id: newMessage.receiver_id,
            name: newMessage.receiver_name || "Người nhận mới",
            lastMessage: newMessage.content,
            timestamp: new Date().toISOString(),
            unread: 1,
            user_status: "Online",
          });
        } else {
          // Cập nhật tin nhắn cuối cùng
          existingReceiver.lastMessage = newMessage.content;
          existingReceiver.timestamp = new Date().toISOString();
          existingReceiver.unread += 1;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      });
  },
});

// Export action creator
export const { updateMessages } = messagesSlice.actions;

export default messagesSlice.reducer;
