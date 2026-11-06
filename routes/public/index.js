import { Router } from "express";
import auth from "./auth.js";
import me from "./me.js";
import match from "./match.js";
import faqs from "./faqs.js";
import notify from "./notify.js";
import payments from "./payments.js";
import settings from "./settings.js";
import images from "./images.js";

const router = Router();

router.use("/auth", auth);
router.use("/me", me);
router.use("/match", match);
router.use("/faqs", faqs);
router.use("/notify", notify);
router.use("/payments", payments);
router.use("/settings", settings);
router.use("/images", images);

export default router;