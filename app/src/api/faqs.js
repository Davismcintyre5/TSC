import api from "./axios.js";

export const getFaqs = () => api.get("/faqs");