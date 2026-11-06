import api from "./axios.js";

export const createNotify = (email) => api.post("/notify", { email });
export const confirmNotify = (token) => api.get(`/notify/confirm?token=${token}`);