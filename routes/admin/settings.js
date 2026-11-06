import { Router } from "express";
import { list, bulkUpdate } from "../../controllers/admin/settingController.js";
import { requireAdmin } from "../../middleware/admin/auth.js";

const router = Router();

router.use(requireAdmin);
router.get("/", list);
router.put("/", bulkUpdate);

export default router;