import { Router } from "express";
import { listFaqs } from "../../controllers/public/faqController.js";

const router = Router();

router.get("/", listFaqs);

export default router;