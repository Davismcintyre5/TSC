import { Router } from "express";
import publicRoutes from "./public/index.js";
import adminRoutes from "./admin/index.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ success: true, message: "API root" });
});

router.use("/", publicRoutes);
router.use("/admin", adminRoutes);

export default router;