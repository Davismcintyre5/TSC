import { Router } from "express";
import { login, me } from "../../controllers/admin/authController.js";
import { requireAdmin } from "../../middleware/admin/auth.js";

const router = Router();

router.post("/login", login);
router.get("/me", requireAdmin, me);

export default router;