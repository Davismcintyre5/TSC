import mongoose from "mongoose";
import env from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDB = async () => {
  mongoose.connection.on("connected", () => logger.info("MongoDB connected"));
  mongoose.connection.on("error", (err) => logger.error({ err }, "MongoDB error"));
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  return mongoose.connection;
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};