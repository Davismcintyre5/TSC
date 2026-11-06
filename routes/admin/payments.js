import { Router } from "express";
import { list, get, confirmBank } from "../../controllers/admin/paymentController.js";
import { requireAdmin } from "../../middleware/admin/auth.js";

const router = Router();

router.use(requireAdmin);
router.get("/", list);
router.get("/:id", get);
router.patch("/:id/confirm", confirmBank);

export default router;