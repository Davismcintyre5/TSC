import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tsc_user_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const body = err.response?.data || {};
    if (err.response?.status === 401) {
      localStorage.removeItem("tsc_user_token");
    }
    return Promise.reject({
      status: err.response?.status || 0,
      code: body?.error?.code || "NETWORK",
      message: body?.error?.message || err.message || "Request failed",
    });
  }
);

export default api;