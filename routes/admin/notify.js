import { Router } from "express";
import { list } from "../../controllers/admin/notifyController.js";
import { requireAdmin } from "../../middleware/admin/auth.js";

const router = Router();

router.use(requireAdmin);
router.get("/", list);

export default router;