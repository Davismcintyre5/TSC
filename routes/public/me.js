import { Router } from "express";
import { me, listTickets, downloadPdf, downloadPng } from "../../controllers/public/meController.js";
import { requireUser } from "../../middleware/client/auth.js";

const router = Router();

router.use(requireUser);
router.get("/", me);
router.get("/tickets", listTickets);
router.get("/tickets/:id/pdf", downloadPdf);
router.get("/tickets/:id/png", downloadPng);

export default router;