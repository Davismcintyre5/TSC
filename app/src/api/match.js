import api from "./axios.js";

export const getMatch = () => api.get("/match");

export const getCategories = (level) =>
  api.get(
    level ? `/match/categories?level=${encodeURIComponent(level)}` : "/match/categories"
  );

export const getLevels = () => api.get("/match/levels");

export const getSeats = (level, section, row) =>
  api.get("/match/seats", {
    params: { level, section, row },
  });