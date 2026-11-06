import crypto from "node:crypto";
import env from "../../config/env.js";
import Payment from "../../models/Payment.js";
import { ApiError } from "../../utils/apiError.js";

const makeReference = () =>
  "TSC-" + crypto.randomBytes(4).toString("hex").toUpperCase();

export const getInstructions = () => ({
  bankName: env.BANK_NAME,
  accountName: env.BANK_ACCOUNT_NAME,
  accountNumber: env.BANK_ACCOUNT_NUMBER,
  branch: env.BANK_BRANCH,
});

export const createPending = async ({ amount, ticketIds }) => {
  if (!env.BANK_ACCOUNT_NUMBER) {
    throw ApiError.internal("Bank payments not configured", "BANK_MISSING");
  }
  const reference = makeReference();
  const payment = await Payment.create({
    ticketIds,
    amount,
    method: "bank",
    status: "awaiting_confirmation",
    bank: {
      reference,
      accountName: env.BANK_ACCOUNT_NAME,
      accountNumber: env.BANK_ACCOUNT_NUMBER,
      bankName: env.BANK_NAME,
    },
  });
  return { payment, reference, instructions: getInstructions() };
};

export const confirm = async ({ paymentId, adminId }) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw ApiError.notFound("Payment not found");
  if (payment.method !== "bank") throw ApiError.badRequest("Not a bank payment");
  if (payment.status === "paid") return payment;

  payment.status = "paid";
  payment.bank.confirmedBy = adminId;
  payment.bank.confirmedAt = new Date();
  await payment.save();
  return payment;
};