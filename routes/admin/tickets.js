import { Router } from "express";
import { list, updateStatus } from "../../controllers/admin/ticketController.js";
import { requireAdmin } from "../../middleware/admin/auth.js";

const router = Router();

router.use(requireAdmin);
router.get("/", list);
router.patch("/:id", updateStatus);

export default router;