import { ApiError } from "../../utils/apiError.js";
import { logger } from "../../utils/logger.js";

export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const code = err.code || "INTERNAL";
  const message = err.isOperational ? err.message : "Internal server error";
  const details = err.isOperational ? err.details || null : null;

  if (status >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, err.message);
  } else {
    logger.warn({ path: req.originalUrl, method: req.method, code }, err.message);
  }

  res.status(status).json({
    success: false,
    error: { code, message, details },
  });
};