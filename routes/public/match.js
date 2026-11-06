import { Router } from "express";
import { getMatch, listCategories, listLevels } from "../../controllers/public/matchController.js";

const router = Router();

router.get("/", getMatch);
router.get("/categories", listCategories);
router.get("/levels", listLevels);

export default router;