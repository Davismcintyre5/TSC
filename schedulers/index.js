import { cleanHolds } from "./clean-holds.js";
import { reduceSeats } from "./reduce-seats.js";
import { logger } from "../utils/logger.js";

const REGISTRY = [
  {
    name: "clean-holds",
    fn: cleanHolds,
    everyMs: 15 * 60 * 1000,
    firstDelayMs: 60 * 1000,
  },
  {
    name: "reduce-seats",
    fn: reduceSeats,
    everyMs: 24 * 60 * 60 * 1000,
    firstDelayMs: 5 * 60 * 1000,
  },
];

const timers = [];
let stopped = false;

const runTask = async (task) => {
  if (stopped) return;
  const started = Date.now();
  try {
    const result = await task.fn();
    logger.info(
      { task: task.name, ms: Date.now() - started, result },
      "scheduler task done"
    );
  } catch (e) {
    logger.error(
      { task: task.name, err: e.message, ms: Date.now() - started },
      "scheduler task failed"
    );
  }
};

const schedule = (task, delayMs) => {
  const t = setTimeout(async () => {
    if (stopped) return;
    await runTask(task);
    schedule(task, task.everyMs);
  }, delayMs);
  if (t.unref) t.unref();
  timers.push(t);
};

export const startSchedulers = () => {
  if (stopped) {
    stopped = false;
  }
  for (const task of REGISTRY) {
    logger.info(
      {
        task: task.name,
        everyMs: task.everyMs,
        firstDelayMs: task.firstDelayMs,
      },
      "scheduler registered"
    );
    schedule(task, task.firstDelayMs);
  }
};

export const stopSchedulers = () => {
  stopped = true;
  while (timers.length) {
    const t = timers.pop();
    clearTimeout(t);
  }
};