import api from "./axios.js";

export const getSettings = () => api.get("/settings");