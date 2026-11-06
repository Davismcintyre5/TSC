import { Router } from "express";
import { publicSettings } from "../../controllers/public/settingController.js";

const router = Router();

router.get("/", publicSettings);

export default router;