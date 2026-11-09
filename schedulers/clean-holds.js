import "../scripts/dnsSet.js";
import "dotenv/config";

import { connectDB, disconnectDB } from "../config/db.js";
import Ticket from "../models/Ticket.js";
import { logger } from "../utils/logger.js";

export const cleanHolds = async () => {
  await connectDB();

  const now = new Date();

  const r = await Ticket.updateMany(
    { status: "held", holdExpiresAt: { $lt: now } },
    { $set: { status: "void" } }
  );

  await disconnectDB();

  if (r.modifiedCount > 0) {
    logger.info({ voided: r.modifiedCount }, "clean-holds: voided expired holds");
  } else {
    logger.debug("clean-holds: nothing to void");
  }

  return { ok: true, voided: r.modifiedCount };
};

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  cleanHolds()
    .then((r) => {
      console.log(r);
      process.exit(r.ok ? 0 : 1);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}