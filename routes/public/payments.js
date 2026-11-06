import { Router } from "express";
import {
  holdTickets,
  mpesaInitiate,
  mpesaCallback,
  cardIntent,
  cardWebhook,
  bankInstructions,
  paymentStatus,
} from "../../controllers/public/paymentController.js";
import botProtection from "../../middleware/global/botProtection.js";
import { mpesaIpAllowlist } from "../../middleware/global/mpesaIpAllowlist.js";

const router = Router();

router.post("/hold", botProtection, holdTickets);
router.post("/mpesa/initiate", botProtection, mpesaInitiate);
router.post("/mpesa/callback", mpesaIpAllowlist, mpesaCallback);
router.post("/card/intent", botProtection, cardIntent);
router.post("/bank/instructions", botProtection, bankInstructions);
router.get("/:id", paymentStatus);

export default router;