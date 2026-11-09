import "../scripts/dnsSet.js";
import "dotenv/config";

import PriceCategory from "../models/PriceCategory.js";
import { logger } from "../utils/logger.js";

const MIN_DROP = 1;
const MAX_DROP = 20;

export const reduceSeats = async () => {
  const cats = await PriceCategory.find({ isActive: true })
    .select("_id level name capacity")
    .lean();

  if (!cats.length) {
    logger.debug("reduce-seats: no active categories");
    return { ok: true, updated: 0, dropped: 0 };
  }

  let totalDropped = 0;
  const changes = [];

  for (const c of cats) {
    const drop = Math.floor(Math.random() * (MAX_DROP - MIN_DROP + 1)) + MIN_DROP;
    const current = c.capacity || 0;
    const next = Math.max(0, current - drop);
    const actualDrop = current - next;

    if (actualDrop === 0) continue;

    await PriceCategory.updateOne({ _id: c._id }, { $set: { capacity: next } });
    totalDropped += actualDrop;
    changes.push({
      level: c.level,
      name: c.name,
      from: current,
      to: next,
      dropped: actualDrop,
    });
  }

  if (changes.length) {
    logger.info(
      { updated: changes.length, dropped: totalDropped, changes },
      "reduce-seats: capacity reduced"
    );
  } else {
    logger.debug("reduce-seats: no categories had capacity to reduce");
  }

  return { ok: true, updated: changes.length, dropped: totalDropped, changes };
};

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  const { connectDB, disconnectDB } = await import("../config/db.js");
  await connectDB();
  try {
    console.log(await reduceSeats());
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}