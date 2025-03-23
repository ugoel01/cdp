import axios from "axios";

// const API_BASE_URL = "https://claim-management-system-1-23yj.onrender.com";
const API_BASE_URL = "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // IMPORTANT: Allows cookies to be sent/received
  withCredentials: true,
});

export default api;
