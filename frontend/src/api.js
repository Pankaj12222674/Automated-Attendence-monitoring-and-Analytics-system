import axios from "axios";

const API = axios.create({
  baseURL: "https://automated-attendence-monitoring-and.onrender.com", // use Vite env if set
  headers: {
    "Content-Type": "application/json",
  },
});

// attach token automatically if exists
API.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
