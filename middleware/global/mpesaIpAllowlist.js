import env from "../../config/env.js";
import { ApiError } from "../../utils/apiError.js";
import { logger } from "../../utils/logger.js";
import { isSafaricomIp } from "../../services/payments/mpesaService.js";

export function mpesaIpAllowlist(req, res, next) {
  if (env.NODE_ENV !== "production") return next();

  const xff = req.headers["x-forwarded-for"];
  const ip =
    (typeof xff === "string" && xff.length > 0 ? xff.split(",")[0].trim() : "") ||
    req.ip;

  if (!isSafaricomIp(ip)) {
    logger.warn(
      { ip, reqIp: req.ip, xff: xff || null, path: req.originalUrl },
      "M-Pesa callback rejected — IP not allowed"
    );
    return next(ApiError.forbidden("Source IP not allowed"));
  }

  next();
}