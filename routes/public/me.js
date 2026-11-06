import { Router } from "express";
import { me, listTickets } from "../../controllers/public/meController.js";
import { requireUser } from "../../middleware/client/auth.js";

const router = Router();

router.use(requireUser);
router.get("/", me);
router.get("/tickets", listTickets);

export default router;