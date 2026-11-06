import { Router } from "express";
import express from "express";
import {
  holdTickets,
  mpesaInitiate,
  paystackWebhook,
  paystackVerify,
  cardIntent,
  cardWebhook,
  bankInstructions,
  paymentStatus,
} from "../../controllers/public/paymentController.js";
import botProtection from "../../middleware/global/botProtection.js";

const router = Router();

router.post("/hold", botProtection, holdTickets);
router.post("/mpesa/initiate", botProtection, mpesaInitiate);

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

router.post("/card/intent", botProtection, cardIntent);
router.post("/card/webhook", express.raw({ type: "application/json" }), cardWebhook);

router.post("/bank/instructions", botProtection, bankInstructions);

router.get("/:id", paymentStatus);

export default router;