import api from "./axios.js";

export const holdTickets = (payload) => api.post("/payments/hold", payload);

export const mpesaInitiate = (paymentId, phone, email, firstName, lastName) =>
  api.post("/payments/mpesa/initiate", { paymentId, phone, email, firstName, lastName });

export const cardIntent = (paymentId, email, firstName, lastName, phone) =>
  api.post("/payments/card/intent", { paymentId, email, firstName, lastName, phone });

export const bankInstructions = (paymentId, email, firstName, lastName, phone) =>
  api.post("/payments/bank/instructions", { paymentId, email, firstName, lastName, phone });

export const paymentStatus = (id) => api.get(`/payments/${id}`);