import { Router } from "express";
import { requestCode, verifyCode } from "../../controllers/public/authController.js";
import { otpLimiter } from "../../middleware/global/rateLimit.js";
import botProtection from "../../middleware/global/botProtection.js";

const router = Router();

router.post("/request-code", botProtection, otpLimiter, requestCode);
router.post("/verify-code", verifyCode);

export default router;