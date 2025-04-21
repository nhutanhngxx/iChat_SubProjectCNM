import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const API_URL = "http://localhost:5001/messages/";
const API_URL = `http://${window.location.hostname}:5001/api/messages/`;

// Lấy tất cả tin nhắn của một người dùng
export const getUserMessages = createAsyncThunk(
  "messages/getUserMessages",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}${userId}`);

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const data = await response.json();

      if (data.status !== "ok") {
        return rejectWithValue(data.message || "Failed to get user messages");
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);
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

// Lấy tin nhắn giữa sender và receiver, có thêm option để lấy tin nhắn đã reply
export const fetchChatMessages = createAsyncThunk(
  "messages/fetchChatMessages",
  async (
    { senderId, receiverId, includeRepliedMessages = false, repliedIds = [] },
    { rejectWithValue }
  ) => {
    try {
      let url = `${API_URL}${senderId}/${receiverId}`;

      // Thêm query params nếu cần
      const params = new URLSearchParams();

      if (includeRepliedMessages) {
        params.append("includeReplies", "true");
      }

      if (repliedIds && repliedIds.length > 0) {
        params.append("replyIds", repliedIds.join(","));
      }

      // Chỉ thêm ? nếu có params
      if (params.toString()) {
        url += "?" + params.toString();
      }

      console.log("Fetching messages from URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        return rejectWithValue(await response.json());
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return rejectWithValue(error.message);
    }
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
// Update the function to handle all media types properly
export const sendImageMessage = createAsyncThunk(
  "messages/sendImageMessage",
  async (
    { sender_id, receiver_id, image, type: forcedType },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("sender_id", sender_id);
      formData.append("receiver_id", receiver_id);
      formData.append("content", ""); // server will handle content from file

      // Determine file type based on MIME type
      let fileType;

      // If type is explicitly provided from the caller, use that
      if (forcedType) {
        fileType = forcedType;
      } else {
        const mimeType = image.type;

        // Better type detection
        if (mimeType.startsWith("image/")) {
          fileType = "image";
        } else if (mimeType.startsWith("video/")) {
          fileType = "video";
        } else if (mimeType.startsWith("audio/")) {
          fileType = "audio";
        } else {
          fileType = "file";
        }
      }

      // Log for debugging
      console.log("Sending file as type:", fileType, "MIME:", image.type);

      formData.append("type", fileType);
      formData.append("chat_type", "private");
      formData.append("file", image);

      // Set content field to avoid validation error
      // This is a temporary value that will be replaced by the server
      formData.append("content", "Uploading media...");

      const response = await fetch(`${API_URL}send-message`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error data send media:", errorText);

        try {
          // Try to parse as JSON if possible
          const errorJson = JSON.parse(errorText);
          return rejectWithValue(errorJson);
        } catch {
          // Fall back to text if not JSON
          return rejectWithValue(errorText);
        }
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error sending media:", err);
      return rejectWithValue({ message: err.message || "Network Error" });
    }
  }
);
// Thu hồi tin nhắn
export const recallToMessage = createAsyncThunk(
  "messages/recallToMessage",
  async (arg, { rejectWithValue }) => {
    try {
      // Handle both formats: single messageId or {messageId, userId} object
      let messageId, userId;

      if (typeof arg === "object") {
        // If called with an object containing both IDs
        messageId = arg.messageId;
        userId = arg.userId;
      } else {
        // If called with just messageId (backward compatibility)
        messageId = arg;
        // userId will be undefined, which will cause a validation error in the backend
      }

      console.log("Recalling message:", { messageId, userId });

      if (!messageId) {
        return rejectWithValue("Missing message ID");
      }

      // Add userId to the request body since your backend needs it
      const response = await fetch(`${API_URL}recall/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }), // Include userId in the body
      });

      // Parse response first so we can handle errors properly
      const data = await response.json();

      if (!response.ok) {
        console.error("Recall API error:", data);
        return rejectWithValue(data);
      }

      console.log("Successful recall response:", data);
      return data;
    } catch (err) {
      console.error("Error in recall thunk:", err);
      // Safely convert error to string to avoid toString() on undefined
      return rejectWithValue(err ? err.toString() : "Unknown error");
    }
  }
);
// Xoá mềm tin nhắn giữa 2 người và trả về lại danh sách đã lọc
export const handleSoftDelete = createAsyncThunk(
  "messages/handleSoftDelete",
  async ({ userId, messageId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}softDelete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, messageId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data.data; // <-- danh sách tin nhắn đã cập nhật
    } catch (error) {
      return rejectWithValue({ error: "Network error" });
    }
  }
);
// Trả lời tin nhắn
export const replyToMessage = createAsyncThunk(
  "messages/replyToMessage",
  async (
    { sender_id, receiver_id, content, type, chat_type, reply_to },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}reply`, {
        method: "POST", // <- phải là POST vì controller dùng POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_id,
          receiver_id,
          content,
          type,
          chat_type,
          reply_to,
        }),
      });

      const data = await response.json(); // <- để dùng trong reject nếu cần

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data; // => { message: "Reply sent successfully", newMessage }
    } catch (error) {
      return rejectWithValue({
        error: "Network error",
        details: error.message,
      });
    }
  }
);
// Cập nhật reacation cho tin nhắn
export const addReactionToMessage = createAsyncThunk(
  "messages/addReaction",
  async ({ messageId, user_id, reaction_type }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}${messageId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, reaction_type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const data = await response.json();
      return data.updatedMessage;
    } catch (error) {
      return rejectWithValue({
        error: "Network error",
        details: error.message,
      });
    }
  }
);

// Xoá reaction cho tin nhắn
export const removeReactionFromMessage = createAsyncThunk(
  "messages/removeReaction",
  async ({ messageId, userId, reaction_type }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}${messageId}/reactions/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reaction_type }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const data = await response.json();
      return data.updatedMessage;
    } catch (error) {
      return rejectWithValue({
        error: "Network error",
        details: error.message,
      });
    }
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    messages: [],
    chatMessages: [],
    userMessages: [], // Thêm mảng userMessages
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    chatStatus: "idle",
    userMessagesStatus: "idle", // Thêm trạng thái
    error: null,
  },
  reducers: {
    updateMessages: (state, action) => {
      const newMessage = action.payload;

      if (!Array.isArray(state.chatMessages)) {
        state.chatMessages = [];
        console.warn(
          "chatMessages was not an array, initialized as empty array"
        );
      }

      const messageExists = state.chatMessages.some(
        (msg) => msg._id === newMessage._id
      );
      const index = state.chatMessages.findIndex(
        (msg) => msg._id === newMessage._id
      );

      // Only add if it doesn't exist
      if (!messageExists) {
        state.chatMessages.push(newMessage);
        console.log("Added new message to state:", newMessage._id);
      } else {
        console.log("Prevented duplicate message:", newMessage._id);
        state.chatMessages[index] = {
          ...state.chatMessages[index],
          ...newMessage, // ghi đè các field cũ bằng cái mới
        };
        console.log("♻️ Updated recalled message:", newMessage._id);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Thêm các case mới cho getUserMessages
      .addCase(getUserMessages.pending, (state) => {
        state.userMessagesStatus = "loading";
      })
      .addCase(getUserMessages.fulfilled, (state, action) => {
        state.userMessagesStatus = "succeeded";
        state.userMessages = action.payload;
      })
      .addCase(getUserMessages.rejected, (state, action) => {
        state.userMessagesStatus = "failed";
        state.error = action.payload || "Failed to fetch user messages";
      })
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
      })
      .addCase(recallToMessage.fulfilled, (state, action) => {
        // Check the structure of the response
        const recalledMessage = action.payload?.data || action.payload;

        if (!recalledMessage || !recalledMessage._id) {
          console.error("Invalid recalled message data:", recalledMessage);
          return;
        }

        const messageId = recalledMessage._id;

        // Find and update the message in chatMessages
        const messageIndex = state.chatMessages.findIndex(
          (msg) => msg._id === messageId
        );

        if (messageIndex !== -1) {
          // Update with all properties from the recalled message
          state.chatMessages[messageIndex] = {
            ...state.chatMessages[messageIndex],
            ...recalledMessage,
            content: "Tin nhắn đã bị thu hồi",
            type: "text",
            recall: true,
            reactions: [],
          };
          console.log("✅ Message recalled successfully:", messageId);
        } else {
          console.warn("Could not find message to recall:", messageId);
        }
      })
      .addCase(handleSoftDelete.pending, (state) => {
        state.chatStatus = "loading";
      })
      .addCase(handleSoftDelete.fulfilled, (state, action) => {
        state.chatStatus = "succeeded";
        if (Array.isArray(action.payload)) {
          state.chatMessages = action.payload;
          console.log(
            "Updated chatMessages after soft delete with array of length:",
            action.payload.length
          );
        } else {
          console.error(
            "Expected array from API but received:",
            typeof action.payload
          );
          if (!Array.isArray(state.chatMessages)) {
            state.chatMessages = [];
          }
        }
      })
      .addCase(handleSoftDelete.rejected, (state, action) => {
        state.chatStatus = "failed";
        state.error = action.payload?.error || action.error.message;
        console.error("Soft delete failed:", state.error);
      })
      .addCase(replyToMessage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(replyToMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.chatMessages.push(action.payload.newMessage); // cập nhật danh sách tin nhắn
      })
      .addCase(replyToMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.error || "Something went wrong";
      })
      .addCase(addReactionToMessage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addReactionToMessage.fulfilled, (state, action) => {
        state.status = "succeeded";

        // Find and update the message with new reaction data
        const updatedMessage = action.payload;
        const messageIndex = state.chatMessages.findIndex(
          (msg) => msg._id === updatedMessage._id
        );

        if (messageIndex !== -1) {
          state.chatMessages[messageIndex] = {
            ...state.chatMessages[messageIndex],
            reactions: updatedMessage.reactions,
          };
          console.log(
            `✅ Updated message ${updatedMessage._id} with new reactions`
          );
        }
      })
      .addCase(addReactionToMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.error || "Failed to add reaction";
        console.error("Failed to add reaction:", action.payload);
      })

      .addCase(removeReactionFromMessage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeReactionFromMessage.fulfilled, (state, action) => {
        state.status = "succeeded";

        // Tìm và cập nhật tin nhắn với dữ liệu reaction mới
        const updatedMessage = action.payload;
        const messageIndex = state.chatMessages.findIndex(
          (msg) => msg._id === updatedMessage._id
        );

        if (messageIndex !== -1) {
          state.chatMessages[messageIndex] = {
            ...state.chatMessages[messageIndex],
            reactions: updatedMessage.reactions,
          };
          console.log(`✅ Removed reaction from message ${updatedMessage._id}`);
        }
      })
      .addCase(removeReactionFromMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.error || "Failed to remove reaction";
        console.error("Failed to remove reaction:", action.payload);
      });
  },
});

export const { updateMessages } = messagesSlice.actions;

export default messagesSlice.reducer;
