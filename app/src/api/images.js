import api from "./axios.js";
export const getImages = () => api.get("/images");