const BRAND = "Talanta";

export const otpCode = ({ code, ttlMinutes }) =>
  `${BRAND}: Your login code is ${code}. Expires in ${ttlMinutes} min. Never share it.`;

export const notifyConfirm = ({ confirmUrl }) =>
  `${BRAND}: Confirm your ticket alert: ${confirmUrl}`;

export const ticketReady = ({ gate, seat, qrUrl }) =>
  `${BRAND}: Ticket ready. Gate ${gate}, Seat ${seat}. View: ${qrUrl}`;

export const paymentSuccess = ({ amount, receipt }) =>
  `${BRAND}: Payment of KSh ${amount} received. Ref ${receipt}.`;

export const paymentFailed = () =>
  `${BRAND}: Payment failed. Try again at talantasportscity.com`;

export const bankAwaiting = ({ reference }) =>
  `${BRAND}: Bank payment pending. Quote ref ${reference}.`;