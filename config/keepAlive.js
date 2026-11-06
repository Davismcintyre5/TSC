import axios from "axios";
import env from "./env.js";
import { logger } from "../utils/logger.js";

let timer = null;
let first = null;
let stopped = false;
let firstPingDone = false;

const INTERVAL_MS = 10 * 60 * 1000;
const FIRST_PING_MS = 60 * 1000;

const getHealthUrl = () => {
  const base = env.APP_ORIGIN || process.env.RENDER_EXTERNAL_URL;
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/health`;
};

const pingHealth = async () => {
  if (stopped) return;

  const url = getHealthUrl();
  if (!url) return;

  const isFirst = !firstPingDone;

  try {
    const res = await axios.get(url, { timeout: 10000 });
    if (isFirst) {
      logger.info({ status: res.status, url }, "Keep-alive: first ping ok");
      firstPingDone = true;
    }
  } catch (err) {
    if (isFirst) {
      logger.warn(
        { error: err.response?.status || err.message, url },
        "Keep-alive: first ping failed"
      );
      firstPingDone = true;
    } else {
      logger.warn(
        { error: err.response?.status || err.message, url },
        "Keep-alive ping failed"
      );
    }
  }
};

const scheduleNext = () => {
  if (stopped) return;
  timer = setTimeout(async () => {
    await pingHealth();
    scheduleNext();
  }, INTERVAL_MS);
  if (timer.unref) timer.unref();
};

export const startKeepAlive = () => {
  if (stopped) return;

  const url = getHealthUrl();
  if (!url) {
    logger.warn("Keep-alive: no external URL available, skipping");
    return;
  }

  logger.info({ url }, "Keep-alive: enabled, first ping in 1 minute");

  first = setTimeout(async () => {
    await pingHealth();
    scheduleNext();
  }, FIRST_PING_MS);
  if (first.unref) first.unref();
};

export const stopKeepAlive = () => {
  stopped = true;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (first) {
    clearTimeout(first);
    first = null;
  }
};