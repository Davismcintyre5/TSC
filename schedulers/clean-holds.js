import "../scripts/dnsSet.js";
import "dotenv/config";

import Ticket from "../models/Ticket.js";
import { logger } from "../utils/logger.js";

export const cleanHolds = async () => {
  const now = new Date();

  const r = await Ticket.updateMany(
    { status: "held", holdExpiresAt: { $lt: now } },
    { $set: { status: "void" } }
  );

  if (r.modifiedCount > 0) {
    logger.info({ voided: r.modifiedCount }, "clean-holds: voided expired holds");
  } else {
    logger.debug("clean-holds: nothing to void");
  }

  return { ok: true, voided: r.modifiedCount };
};

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  const { connectDB, disconnectDB } = await import("../config/db.js");
  await connectDB();
  try {
    console.log(await cleanHolds());
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}