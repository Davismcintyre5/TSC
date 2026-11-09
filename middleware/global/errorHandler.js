import { ApiError } from "../../utils/apiError.js";
import { logger } from "../../utils/logger.js";

export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.name === "MongoNotConnectedError" || err.type === "MongoNotConnectedError") {
    logger.warn(
      { path: req.originalUrl, method: req.method },
      "Mongo not connected — likely reconnecting"
    );
    return res.status(503).json({
      success: false,
      error: {
        code: "DB_UNAVAILABLE",
        message: "Database temporarily unavailable. Please retry.",
      },
    });
  }

  if (err.name === "MongooseServerSelectionError") {
    logger.warn(
      { path: req.originalUrl, method: req.method },
      "Mongo server selection failed"
    );
    return res.status(503).json({
      success: false,
      error: {
        code: "DB_UNAVAILABLE",
        message: "Database temporarily unavailable. Please retry.",
      },
    });
  }

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