import { hdm, hdmDefaults } from "../config/hdmBridge.js";
import { logger } from "../utils/logger.js";
import { getPublicSettings } from "./settingService.js";
import * as tpl from "../templates/emailTemplates.js";

const send = async ({ to, subject, htmlBody, textBody, replyTo }) => {
  try {
    const { data } = await hdm.post("/emails/send", {
      from: hdmDefaults.fromEmail,
      fromName: hdmDefaults.fromName,
      to,
      subject,
      htmlBody,
      textBody,
      replyTo,
    });
    return data;
  } catch (err) {
    logger.error({ err: err.response?.data || err.message, to }, "Email send failed");
    throw err;
  }
};

const build = async (templateFn, payload) => {
  const settings = await getPublicSettings();
  return templateFn({ ...payload, ...settings });
};

export const sendOtp = async (to, payload) => {
  const t = await build(tpl.otpCode, payload);
  return send({ to, subject: t.subject, htmlBody: t.html, textBody: t.text });
};

export const sendNotifyConfirm = async (to, payload) => {
  const t = await build(tpl.notifyConfirm, payload);
  return send({ to, subject: t.subject, htmlBody: t.html, textBody: t.text });
};

export const sendTicketReady = async (to, payload) => {
  const t = await build(tpl.ticketReady, payload);
  return send({ to, subject: t.subject, htmlBody: t.html, textBody: t.text });
};

export const sendPaymentSuccess = async (to, payload) => {
  const t = await build(tpl.paymentSuccess, payload);
  return send({ to, subject: t.subject, htmlBody: t.html, textBody: t.text });
};

export const sendPaymentFailed = async (to, payload) => {
  const t = await build(tpl.paymentFailed, payload);
  return send({ to, subject: t.subject, htmlBody: t.html, textBody: t.text });
};

export const sendBankAwaiting = async (to, payload) => {
  const t = await build(tpl.bankAwaiting, payload);
  return send({ to, subject: t.subject, htmlBody: t.html, textBody: t.text });
};