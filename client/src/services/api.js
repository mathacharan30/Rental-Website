import axios from "axios";

// Axios instance for the frontend -> backend API
const RAW_BASE_URL = import.meta.env.VITE_API_URL;
const BASE_URL = (RAW_BASE_URL || "").replace(/\/+$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

// Attach Authorization header if access token is present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error("Failed to set auth header", e);
  }
  return config;
});

// Auto-refresh access token on 401 and retry once
let isRefreshing = false;
let pendingRequests = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config || {};
    const status = error?.response?.status;

    if (status === 401 && !original._retry) {
      if (isRefreshing) {
        // queue the request until refresh resolves
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject, config: original });
        });
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");
        const bare = axios.create({ baseURL: BASE_URL });
        const { data } = await bare.post("/api/auth/token", { refreshToken });
        if (data?.accessToken)
          localStorage.setItem("accessToken", data.accessToken);
        if (data?.refreshToken)
          localStorage.setItem("refreshToken", data.refreshToken);

        // replay queued requests with their original configs
        const queued = pendingRequests.slice();
        pendingRequests = [];
        queued.forEach(({ resolve, config }) => resolve(api(config)));

        // retry the original request
        return api(original);
      } catch (e) {
        // reject queued requests
        const queued = pendingRequests.slice();
        pendingRequests = [];
        queued.forEach(({ reject }) => reject(e));
        // clear tokens on hard auth failure and redirect to login if on admin
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          if (
            typeof window !== "undefined" &&
            window.location?.pathname?.startsWith("/admin")
          ) {
            window.location.href = "/admin/login";
          }
        } catch (e) {
          console.error("Failed to redirect to login", e);
        }
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
