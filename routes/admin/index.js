import { Router } from "express";
import auth from "./auth.js";
import match from "./match.js";
import categories from "./categories.js";
import faqs from "./faqs.js";
import notify from "./notify.js";
import tickets from "./tickets.js";
import payments from "./payments.js";
import settings from "./settings.js";
import images from "./images.js";

const router = Router();

router.use("/auth", auth);
router.use("/match", match);
router.use("/categories", categories);
router.use("/faqs", faqs);
router.use("/notify", notify);
router.use("/tickets", tickets);
router.use("/payments", payments);
router.use("/settings", settings);
router.use("/images", images);

export default router;