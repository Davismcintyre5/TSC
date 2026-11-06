import env from "./env.js";

const mpesaConfig = {
  baseUrl: env.MPESA_BASE_URL,
  consumerKey: env.MPESA_CONSUMER_KEY,
  consumerSecret: env.MPESA_CONSUMER_SECRET,
  shortCode: env.MPESA_SHORTCODE,
  passkey: env.MPESA_PASSKEY,
  callbackUrl: env.MPESA_CALLBACK_URL,
  transactionType: env.MPESA_TRANSACTION_TYPE || "CustomerPayBillOnline",
  tillNumber: env.MPESA_TILL_NUMBER || "",
};

export default mpesaConfig;