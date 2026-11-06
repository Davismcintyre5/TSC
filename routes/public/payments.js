import { Router } from "express";
import express from "express";
import {
  holdTickets,
  mpesaInitiate,
  mpesaCallback,
  paystackInitiate,
  paystackWebhook,
  paystackVerify,
  cardIntent,
  cardWebhook,
  bankInstructions,
  paymentStatus,
} from "../../controllers/public/paymentController.js";
import botProtection from "../../middleware/global/botProtection.js";
import { mpesaIpAllowlist } from "../../middleware/global/mpesaIpAllowlist.js";

const router = Router();

// ---- Tickets ----
router.post("/hold", botProtection, holdTickets);

// ---- Daraja M-Pesa (unchanged) ----
router.post("/mpesa/initiate", botProtection, mpesaInitiate);
router.post("/mpesa/callback", mpesaIpAllowlist, mpesaCallback);

// ---- Paystack M-Pesa (new) ----
router.post("/paystack/initiate", botProtection, paystackInitiate);
router.post(
  "/paystack/webhook",
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
  paystackWebhook
);
router.get("/paystack/verify/:reference", paystackVerify);

// ---- Stripe card ----
router.post("/card/intent", botProtection, cardIntent);
router.post(
  "/card/webhook",
  express.raw({ type: "application/json" }),
  cardWebhook
);

// ---- Bank transfer ----
router.post("/bank/instructions", botProtection, bankInstructions);

// ---- Status (must stay last) ----
router.get("/:id", paymentStatus);

export default router;