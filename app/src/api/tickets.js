import api from "./axios.js";

export const myTickets = () => api.get("/me/tickets");

export const downloadTicketPdf = (id) =>
  api.get(`/me/tickets/${id}/pdf`, { responseType: "blob" });

export const downloadTicketPng = (id) =>
  api.get(`/me/tickets/${id}/png`, { responseType: "blob" });