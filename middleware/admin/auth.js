import { ApiError } from "../../utils/apiError.js";
import { verifyToken } from "../../utils/token.js";
import Admin from "../../models/Admin.js";

export const requireAdmin = async (req, res, next) => {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(ApiError.unauthorized("Missing token"));

  try {
    const payload = verifyToken(token);
    if (payload.scope !== "admin") return next(ApiError.forbidden("Invalid scope"));

    const admin = await Admin.findById(payload.sub).select("-passwordHash");
    if (!admin || !admin.isActive) return next(ApiError.unauthorized("Admin not found or inactive"));

    req.admin = admin;
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
};