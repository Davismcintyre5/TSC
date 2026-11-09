import { Router } from "express";
import {
  getMatch,
  listCategories,
  listLevels,
  listSeats,
} from "../../controllers/public/matchController.js";

const router = Router();

router.get("/", getMatch);
router.get("/categories", listCategories);
router.get("/levels", listLevels);
router.get("/seats", listSeats);

export default router;