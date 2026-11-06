import { hdm, hdmDefaults } from "../config/hdmBridge.js";
import { logger } from "../utils/logger.js";
import * as tpl from "../templates/smsTemplates.js";

const send = async ({ to, content }) => {
  if (!hdmDefaults.smsEnabled) {
    logger.info({ to, content }, "SMS disabled — skipped");
    return { success: true, skipped: true };
  }
  try {
    const { data } = await hdm.post("/sms/send", {
      to,
      content,
      sender: hdmDefaults.smsSender,
      type: "transactional",
    });
    return data;
  } catch (err) {
    logger.error({ err: err.response?.data || err.message, to }, "SMS send failed");
    throw err;
  }
};

export const sendOtp = (to, payload) =>
  send({ to, content: tpl.otpCode(payload) });

export const sendNotifyConfirm = (to, payload) =>
  send({ to, content: tpl.notifyConfirm(payload) });

export const sendTicketReady = (to, payload) =>
  send({ to, content: tpl.ticketReady(payload) });

export const sendPaymentSuccess = (to, payload) =>
  send({ to, content: tpl.paymentSuccess(payload) });

export const sendPaymentFailed = (to) =>
  send({ to, content: tpl.paymentFailed() });

export const sendBankAwaiting = (to, payload) =>
  send({ to, content: tpl.bankAwaiting(payload) });