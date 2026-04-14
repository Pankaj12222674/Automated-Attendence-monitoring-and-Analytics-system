import axios from "axios";

const api = axios.create({
  // Automatically falls back to current origin if VITE_API_URL is missing
  baseURL: import.meta.env.VITE_API_URL || "", 
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;