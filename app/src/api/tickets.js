import api from "./axios.js";

export const myTickets = () => api.get("/me/tickets");