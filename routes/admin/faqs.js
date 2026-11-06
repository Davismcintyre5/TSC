import { Router } from "express";
import { list, create, update, remove } from "../../controllers/admin/faqController.js";
import { requireAdmin } from "../../middleware/admin/auth.js";

const router = Router();

router.use(requireAdmin);
router.get("/", list);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;