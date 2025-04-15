import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const API_URL = "http://localhost:5001/messages/";
const API_URL = `http://${window.location.hostname}:5001/api/messages/`;

// Lấy danh sách người nhận gần nhất
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (id) => {
    const response = await fetch(`${API_URL}recent-receivers/${id}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error("Failed to fetch messages", data.message);
    }
    return data.data;
  }
);

// Lấy tin nhắn giữa sender và receiver
export const fetchChatMessages = createAsyncThunk(
  "messages/fetchChatMessages",
  async ({ senderId, receiverId }) => {
    const response = await fetch(`${API_URL}${senderId}/${receiverId}`);
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
// Gửi ảnh
export const sendImageMessage = createAsyncThunk(
  "messages/sendImageMessage",
  async ({ sender_id, receiver_id, image }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("sender_id", sender_id);
      formData.append("receiver_id", receiver_id);
      formData.append("content", ""); // server sẽ tự xử lý content từ file
      // Tự động xác định type
      const mimeType = image.type;
      const isImage = mimeType.startsWith("image/");
      const fileType = isImage ? "image" : "file";

      formData.append("type", fileType);
      formData.append("chat_type", "private");

      formData.append("file", image); // đơn giản là File gốc từ input
      console.log("formData", formData);
      const response = await fetch(`${API_URL}send-message`, {
        method: "POST",
        body: formData,
        // headers: {
        //   "Content-Type": "multipart/form-data",
        // },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error data send image:", errorData);

        return rejectWithValue(errorData);
      }

      return await response.json();
    } catch (err) {
      console.error("Error sending image:", err);
      return rejectWithValue({ message: "Network Error" });
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
    updateMessages: (state, action) => {
      const newMessage = action.payload;

      // Check if message with same ID already exists in state
      const messageExists = state.chatMessages.some(
        (msg) => msg._id === newMessage._id
      );

      // Only add if it doesn't exist
      if (!messageExists) {
        state.chatMessages.push(newMessage);
        console.log("Added new message to state:", newMessage._id);
      } else {
        console.log("Prevented duplicate message:", newMessage._id);
      }
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
      })
      .addCase(sendImageMessage.fulfilled, (state, action) => {
        const newMessage = action.payload.data;

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
          existingReceiver.lastMessage = newMessage.content;
          existingReceiver.timestamp = new Date().toISOString();
          existingReceiver.unread += 1;
        }
      });
  },
});

// Export action creator
export const { updateMessages } = messagesSlice.actions;

export default messagesSlice.reducer;
