import api from "./axios.js";

export const requestCode = (identifier) =>
  api.post("/auth/request-code", { identifier });

export const verifyCode = (identifier, code) =>
  api.post("/auth/verify-code", { identifier, code });

export const me = () => api.get("/me");