import "./dnsSet.js";
import "dotenv/config";

import { connectDB, disconnectDB } from "../config/db.js";
import Ticket from "../models/Ticket.js";

const main = async () => {
  await connectDB();

  const before = await Ticket.countDocuments({ status: { $in: ["held", "void"] } });
  console.log(`Found ${before} held/void tickets`);

  if (before === 0) {
    console.log("Nothing to delete.");
    await disconnectDB();
    process.exit(0);
  }

  const r = await Ticket.deleteMany({ status: { $in: ["held", "void"] } });
  console.log(`Deleted: ${r.deletedCount}`);

  await disconnectDB();
  process.exit(0);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});