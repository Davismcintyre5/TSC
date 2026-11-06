import env from "../../config/env.js";
import { logger } from "../../utils/logger.js";

export const safaricomIP = (req, res, next) => {
  const allow = env.SAFARICOM_IPS || [];
  if (allow.length === 0) return next();

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress;
  if (!allow.includes(ip)) {
    logger.warn({ ip, path: req.originalUrl }, "Safaricom callback rejected");
    return res.status(403).json({
      success: false,
      error: { code: "IP_NOT_ALLOWED", message: "Forbidden" },
    });
  }
  next();
};