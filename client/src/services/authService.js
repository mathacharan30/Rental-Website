import api from "./api";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_KEY) || null;
  } catch {
    return null;
  }
}
export function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_KEY) || null;
  } catch {
    return null;
  }
}
export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function login({ email, password, role = "user" }) {
  const { data } = await api.post("/api/auth/login", { email, password, role });
  if (data?.accessToken) localStorage.setItem(ACCESS_KEY, data.accessToken);
  if (data?.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
  return data?.user || null;
}

export async function signup(userData) {
  const { data } = await api.post("/api/auth/signup", userData);
  if (data?.accessToken) localStorage.setItem(ACCESS_KEY, data.accessToken);
  if (data?.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
  return data?.user || null;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) await api.post("/api/auth/logout", { refreshToken });
  } finally {
    clearTokens();
  }
}

export default {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  login,
  logout,
};
