import { Router } from "express";
import { listImages } from "../../controllers/public/imageController.js";

const router = Router();
router.get("/", listImages);

export default router;