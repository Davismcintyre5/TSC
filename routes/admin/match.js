import { Router } from "express";
import { get, update } from "../../controllers/admin/matchController.js";
import { requireAdmin } from "../../middleware/admin/auth.js";

const router = Router();

router.use(requireAdmin);
router.get("/", get);
router.put("/", update);

export default router;