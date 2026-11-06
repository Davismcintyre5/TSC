import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import env from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";
import { startKeepAlive, stopKeepAlive } from "./config/keepAlive.js";
import helmetMiddleware from "./middleware/global/helmet.js";
import corsMiddleware from "./middleware/global/cors.js";
import requestLogger from "./middleware/global/requestLogger.js";
import { baseLimiter } from "./middleware/global/rateLimit.js";
import botProtection from "./middleware/global/botProtection.js";
import { notFound, errorHandler } from "./middleware/global/errorHandler.js";
import routes from "./routes/index.js";
import { cardWebhook } from "./controllers/public/paymentController.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "app", "dist");
const DIST_INDEX = path.join(DIST, "index.html");
const hasDist = fs.existsSync(DIST_INDEX);

const app = express();

app.set("trust proxy", 1);

app.use(helmetMiddleware);
app.use(corsMiddleware);

app.get("/health", (req, res) => {
  res.json({ ok: true, ts: Date.now(), env: env.NODE_ENV });
});

app.post(
  "/api/payments/card/webhook",
  express.raw({ type: "application/json" }),
  cardWebhook
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(botProtection);
app.use(baseLimiter);

app.use("/api", routes);

if (hasDist) {
  app.use(express.static(DIST, { index: false, maxAge: "1h" }));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(DIST_INDEX);
  });
}

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server listening on :${env.PORT} (${env.NODE_ENV})`);

    if (hasDist) {
      logger.info(`Serving app from ${DIST} + API at /api`);
    } else {
      logger.warn(
        `API only — app/dist/index.html not found. Run "npm run build" to serve the client.`
      );
    }

    startKeepAlive();
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down`);
    stopKeepAlive();
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});