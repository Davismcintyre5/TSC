import { stripe, stripeConfig } from "../../config/stripe.js";
import { ApiError } from "../../utils/apiError.js";
import { logger } from "../../utils/logger.js";

export const createIntent = async ({ amount, currency = "KES", metadata = {} }) => {
  if (!stripe) throw ApiError.internal("Card payments not configured", "STRIPE_MISSING");
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata,
  });
  return {
    id: intent.id,
    clientSecret: intent.client_secret,
    publishableKey: stripeConfig.publishableKey,
  };
};

export const verifyWebhook = (rawBody, signature) => {
  if (!stripe) throw ApiError.internal("Card payments not configured", "STRIPE_MISSING");
  try {
    return stripe.webhooks.constructEvent(rawBody, signature, stripeConfig.webhookSecret);
  } catch (err) {
    logger.warn({ err: err.message }, "Stripe webhook signature invalid");
    throw ApiError.badRequest("Invalid webhook signature", "WEBHOOK_INVALID");
  }
};