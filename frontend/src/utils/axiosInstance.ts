// src/utils/axiosInstance.ts
import axios from "axios";

// Public instance (no auth header)
export const publicApi = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Private instance (adds token automatically)
export const privateApi = axios.create({
  baseURL: "http://localhost:8080/api",
});

privateApi.interceptors.request.use(
  (config) => {
    const savedUserInfo = localStorage.getItem("userInfo");
    if (savedUserInfo) {
      const { token } = JSON.parse(savedUserInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
