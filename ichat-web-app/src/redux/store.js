import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import messageReducer from "./slices/messagesSlice";
import friendReducer from "./slices/friendSlice";
import groupReducer from "./slices/groupSlice";

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
  messages: messageReducer,
  friends: friendReducer,
  groups: groupReducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export const persistor = persistStore(store);

export default store;
