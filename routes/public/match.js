import { Router } from "express";
import { getMatch, listCategories } from "../../controllers/public/matchController.js";

const router = Router();

router.get("/", getMatch);
router.get("/categories", listCategories);

export default router;