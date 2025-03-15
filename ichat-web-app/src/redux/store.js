import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import messagesSlice from "./slices/messagesSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messagesSlice,
  },
});

export default store;
