import axios from "axios";
import * as Network from "expo-network";
import Constants from "expo-constants";

const getDeviceIPv4 = async () => {
  const networkState = await Network.getNetworkStateAsync();
  return networkState?.type === Network.NetworkStateType.WIFI
    ? await Network.getIpAddressAsync()
    : null;
};

// Lấy IP của máy tính đang chạy metro bundler
const getHostIP = () => {
  try {
    // Lấy địa chỉ host từ manifest của Expo
    const debuggerHost =
      Constants.expoConfig?.hostUri || // Expo SDK 48+
      Constants.manifest2?.extra?.expoGo?.debuggerHost; // Expo SDK 46-47
    // || Constants.manifest?.debuggerHost; // Phiên bản cũ (deprecated)

    if (debuggerHost) {
      // debuggerHost có dạng "192.168.x.x:19000", cần tách phần IP
      const hostIP = debuggerHost.split(":")[0];
      return hostIP;
    }

    return null;
  } catch (error) {
    console.error("Error getting host IP:", error);
    return null;
  }
};

// Tạo API instance
const createApi = async () => {
  const DEFAULT_IP = "192.168.1.6";
  const PORT = 5001;

  const hostIP = getHostIP();
  console.log("Host IP:", hostIP);

  const api = axios.create({
    baseURL: `http://${hostIP || DEFAULT_IP}:${PORT}`,
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

  return api;
};

// Tạo một instance API duy nhất
// để tránh việc tạo nhiều instance không cần thiết
let apiInstance = null;
const getApi = async () => {
  if (!apiInstance) {
    apiInstance = await createApi();
  }
  return apiInstance;
};

// Câu hình HTTP request - wrappers
const apiService = {
  get: async (url, config) => {
    const api = await getApi();
    return api.get(url, config);
  },

  post: async (url, data, config) => {
    const api = await getApi();
    return api.post(url, data, config);
  },

  put: async (url, data, config) => {
    const api = await getApi();
    return api.put(url, data, config);
  },

  delete: async (url, config) => {
    const api = await getApi();
    return api.delete(url, config);
  },

  patch: async (url, data, config) => {
    const api = await getApi();
    return api.patch(url, data, config);
  },
};

export { apiService, getApi, createApi, getHostIP, getDeviceIPv4 };
