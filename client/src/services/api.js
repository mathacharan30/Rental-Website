import axios from "axios";
import { auth } from "../config/firebase";

// Axios instance for the frontend -> backend API
const RAW_BASE_URL = import.meta.env.VITE_API_URL;
const BASE_URL = (RAW_BASE_URL || "").replace(/\/+$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

// Attach a fresh Firebase ID token on every request (if a user is signed in)
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error("[api] Failed to attach Firebase token:", e.message);
  }
  return config;
});

// On 401 responses just let the caller handle it – Firebase tokens are
// short-lived and auto-refreshed by the SDK; no manual refresh needed.
api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error)
);

export default api;
