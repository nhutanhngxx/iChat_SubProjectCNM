import axios from "axios";
const API_iChat = "http://172.20.10.5:5001";

const api = axios.create({
  baseURL: API_iChat,
  timeout: 10000, // Request sẽ bị hủy nếu quá x giây
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
