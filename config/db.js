import mongoose from "mongoose";
import env from "./env.js";
import { logger } from "../utils/logger.js";

mongoose.set("bufferCommands", false);

let reconnectAttempts = 0;
let reconnectTimer = null;
const MAX_RECONNECT_DELAY = 30000;

const connectWithRetry = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    reconnectAttempts = 0;
  } catch (err) {
    reconnectAttempts += 1;
    const delay = Math.min(1000 * 2 ** reconnectAttempts, MAX_RECONNECT_DELAY);
    logger.error(
      { err: err.message, attempt: reconnectAttempts, retryInMs: delay },
      "MongoDB connect failed — retrying"
    );
    reconnectTimer = setTimeout(connectWithRetry, delay);
    if (reconnectTimer.unref) reconnectTimer.unref();
  }
};

export const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    reconnectAttempts = 0;
    logger.info("MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    logger.error({ err: err.message }, "MongoDB error");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected — will retry");
    if (reconnectAttempts === 0) {
      reconnectTimer = setTimeout(connectWithRetry, 5000);
      if (reconnectTimer.unref) reconnectTimer.unref();
    }
  });

  mongoose.connection.on("reconnected", () => {
    reconnectAttempts = 0;
    logger.info("MongoDB reconnected");
  });

  await connectWithRetry();
  return mongoose.connection;
};

export const disconnectDB = async () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  await mongoose.disconnect();
};