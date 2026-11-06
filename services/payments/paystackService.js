// services/payments/paystackService.js
import axios from "axios";
import crypto from "crypto";
import { logger } from "../../utils/logger.js";

class PaystackError extends Error {
  constructor(message, code, raw) {
    super(message);
    this.name = "PaystackError";
    this.code = code;
    this.raw = raw;
  }
}

let CONFIG = {
  baseUrl: "https://api.paystack.co",
  secretKey: process.env.PAYSTACK_SECRET_KEY || "",
  callbackUrl: process.env.PAYSTACK_CALLBACK_URL || "",
  webhookSecret: process.env.PAYSTACK_SECRET_KEY || "", // Paystack signs with same secret key
};

const configure = (overrides = {}) => {
  CONFIG = { ...CONFIG, ...overrides };
};

const getConfig = () => ({ ...CONFIG });

const assertConfig = () => {
  if (!CONFIG.secretKey) {
    throw new PaystackError("Paystack secret key not configured", "CONFIG_MISSING");
  }
};

const http = axios.create({
  baseURL: CONFIG.baseUrl,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${CONFIG.secretKey}`;
  return config;
});

const handleError = (error, context) => {
  const err = error.response?.data || error.message;
  logger.error(`Paystack ${context} error`, { err });
  return new PaystackError(
    typeof err === "string" ? err : JSON.stringify(err),
    "PAYSTACK_API_FAILED",
    err
  );
};

/**
 * Normalize Kenyan phone to +2547XXXXXXXX format.
 * Paystack mobile_money requires E.164.
 */
const normalizePhone = (phone) => {
  let p = String(phone).replace(/\D/g, "");
  if (p.startsWith("0")) p = "254" + p.slice(1);
  else if (p.startsWith("7") || p.startsWith("1")) p = "254" + p;
  else if (p.startsWith("254")) p = p;
  return "+" + p;
};

/**
 * Initialize a transaction with mobile_money channel -> triggers M-Pesa STK push.
 * amountKES is in KES; converted to kobo (×100).
 */
const initiateSTKPush = async ({
  email,
  phone,
  amountKES,
  reference,
  metadata = {},
  callbackUrl,
}) => {
  try {
    assertConfig();
    if (!email) throw new PaystackError("Email required for Paystack", "EMAIL_REQUIRED");

    const payload = {
      email,
      amount: Math.round(Number(amountKES) * 100),
      currency: "KES",
      phone: normalizePhone(phone),
      channels: ["mobile_money"],
      callback_url: callbackUrl || CONFIG.callbackUrl || undefined,
      reference: reference || undefined,
      metadata,
    };

    const { data } = await http.post("/transaction/initialize", payload);

    if (!data?.status) {
      return { success: false, error: data };
    }

    return {
      success: true,
      reference: data.data.reference,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      raw: data.data,
    };
  } catch (error) {
    logger.error("Paystack STK Push error", { err: error.response?.data || error.message });
    return { success: false, error: error.response?.data || { errorMessage: error.message } };
  }
};

/**
 * Verify a transaction by reference. Use this server-side after redirect OR
 * before fulfilling any order. NEVER trust the frontend callback alone.
 */
const verifyTransaction = async (reference) => {
  try {
    assertConfig();
    const { data } = await http.get(`/transaction/verify/${encodeURIComponent(reference)}`);
    if (!data?.status) return { success: false, error: data };

    const tx = data.data;
    return {
      success: true,
      status: tx.status, // "success" | "failed" | "abandoned" | "ongoing"
      reference: tx.reference,
      amount: tx.amount / 100,
      currency: tx.currency,
      channel: tx.channel,
      paidAt: tx.paid_at,
      gatewayResponse: tx.gateway_response,
      metadata: tx.metadata,
      customer: tx.customer,
      authorization: tx.authorization,
      raw: tx,
    };
  } catch (error) {
    return { success: false, error: error.response?.data || { errorMessage: error.message } };
  }
};

/**
 * Verify webhook signature. Paystack signs the raw request body with the secret key.
 * Returns true if valid.
 */
const verifyWebhookSignature = (rawBody, signature) => {
  if (!rawBody || !signature) return false;
  if (!CONFIG.webhookSecret) return false;
  try {
    const hash = crypto
      .createHmac("sha512", CONFIG.webhookSecret)
      .update(rawBody)
      .digest("hex");
    // timing-safe compare
    const a = Buffer.from(hash, "utf8");
    const b = Buffer.from(String(signature), "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    logger.error("Paystack webhook signature verify error", { err: err.message });
    return false;
  }
};

/**
 * Parse a Paystack webhook event into a uniform shape.
 */
const parseWebhook = (body) => {
  if (!body || typeof body !== "object" || !body.event) {
    return { valid: false, error: "Invalid webhook payload" };
  }

  const { event, data } = body;

  if (event === "charge.success") {
    return {
      valid: true,
      event,
      success: true,
      reference: data.reference,
      amount: data.amount / 100,
      currency: data.currency,
      channel: data.channel,
      paidAt: data.paid_at,
      gatewayResponse: data.gateway_response,
      metadata: data.metadata || {},
      customerEmail: data.customer?.email,
      customerPhone: data.customer?.phone,
      authorization: data.authorization,
      raw: data,
    };
  }

  if (event === "charge.failed") {
    return {
      valid: true,
      event,
      success: false,
      reference: data.reference,
      gatewayResponse: data.gateway_response,
      metadata: data.metadata || {},
      raw: data,
    };
  }

  // Other events (transfer.success, refund.processed, etc.) — pass through
  return {
    valid: true,
    event,
    success: null,
    reference: data?.reference,
    metadata: data?.metadata || {},
    raw: data,
  };
};

export {
  configure,
  getConfig,
  normalizePhone,
  initiateSTKPush,
  verifyTransaction,
  verifyWebhookSignature,
  parseWebhook,
  PaystackError,
};