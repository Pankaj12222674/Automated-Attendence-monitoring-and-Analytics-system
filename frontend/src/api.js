import axios from "axios"; localhost
 * - Production → Render backend
 */
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://automated-attendence-monitoring-and.onrender.com";

/**
 * Axios instance
 */
const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // Render cold start safe
});

/**
 * Attach JWT token automatically if exists
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Global response handling (safe for prod)
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    }

    return Promise.reject(error);
  }
);

export default API;

/**
 * Auto-detect API base URL
