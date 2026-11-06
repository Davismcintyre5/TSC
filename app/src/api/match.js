import api from "./axios.js";

export const getMatch = () => api.get("/match");
export const getCategories = () => api.get("/match/categories");