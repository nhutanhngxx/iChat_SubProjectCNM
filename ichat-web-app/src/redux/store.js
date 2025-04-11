import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import messagesSlice from "./slices/messagesSlice";

import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Lưu vào localStorage
import { combineReducers } from "redux";

// Cấu hình persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Chỉ persist messages
};
// Gộp reducers lại với nhau
const rootReducer = combineReducers({
  auth: authReducer,
  messages: messagesSlice,
}); 
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  // reducer: {
  //   // auth: authReducer,
  //   // messages: persistedMessagesReducer, // Chỉ persist messages
  //   reducer: persistedReducer,
  //   messages: messagesSlice, // Chỉ persist messages
  // }, 
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
});

export const persistor = persistStore(store);

export default store;
