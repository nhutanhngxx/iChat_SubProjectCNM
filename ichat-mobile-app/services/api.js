import axios from "axios";
import { NetworkInfo } from "react-native-network-info";

const API_iChat = "http://172.20.65.7:5001";

NetworkInfo.getIPAddress().then((ipAddress) => {
  console.log("Device IP Address: ", ipAddress);
});

const api = axios.create({
  baseURL: API_iChat,
  // timeout: 10000, // Request sẽ bị hủy nếu quá x giây
  headers: { "Content-Type": "application/json" },
});

// Add a request interceptor to log errors
api.interceptors.request.use(
  (res) => res,
  (err) => {
    console.log("API Error: ", err.response?.data || err.message);
    return Promise.reject(err); // Trả lỗi về cho phần (component) gọi API
  }
);

export default api;
