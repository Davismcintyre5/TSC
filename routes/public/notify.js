import { Router } from "express";
import { create, confirm } from "../../controllers/public/notifyController.js";
import { notifyLimiter } from "../../middleware/global/rateLimit.js";
import botProtection from "../../middleware/global/botProtection.js";

const router = Router();

router.post("/", botProtection, notifyLimiter, create);
router.get("/confirm", confirm);

export default router;