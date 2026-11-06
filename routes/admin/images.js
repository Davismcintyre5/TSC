import { Router } from "express";
import * as c from "../../controllers/admin/imageController.js";
import { requireAdmin } from "../../middleware/admin/auth.js";

const router = Router();
router.use(requireAdmin);
router.post("/signature", c.signature);
router.get("/", c.list);
router.post("/", c.create);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

export default router;