import axios from "axios";
import env from "./env.js";

export const hdm = axios.create({
  baseURL: env.HDM_API_URL,
  headers: {
    Authorization: `Bearer ${env.HDM_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export const hdmDefaults = {
  fromEmail: env.HDM_FROM_EMAIL,
  fromName: env.HDM_FROM_NAME,
  smsSender: env.HDM_SMS_SENDER,
  smsEnabled: env.SMS_ENABLED,
};