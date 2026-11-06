import { ApiError } from "../../utils/apiError.js";
import { verifyToken } from "../../utils/token.js";

export const requireUser = (req, res, next) => {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(ApiError.unauthorized("Missing token"));

  try {
    const payload = verifyToken(token);
    if (payload.scope !== "user") return next(ApiError.forbidden("Invalid scope"));
    req.user = { identifier: payload.sub };
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
};