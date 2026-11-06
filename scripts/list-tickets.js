import "./dnsSet.js";
import "dotenv/config";

import { connectDB, disconnectDB } from "../config/db.js";
import Ticket from "../models/Ticket.js";

const main = async () => {
  await connectDB();

  const rows = await Ticket.find({ status: { $in: ["held", "void"] } })
    .select("serial status gate seat price currency buyer.name buyer.email buyer.phone createdAt holdExpiresAt paidAt")
    .sort({ status: 1, createdAt: -1 })
    .lean();

  const byStatus = {};
  for (const r of rows) {
    (byStatus[r.status] ||= []).push(r);
  }

  for (const [status, items] of Object.entries(byStatus)) {
    console.log(`\n=== ${status.toUpperCase()} (${items.length}) ===`);
    for (const t of items) {
      const buyer = t.buyer?.email || t.buyer?.phone || "(no buyer)";
      const hold = t.holdExpiresAt
        ? ` | holdUntil ${new Date(t.holdExpiresAt).toISOString()}`
        : "";
      console.log(
        `${t.serial} | ${t.status} | ${t.seat.section} · Row ${t.seat.row} · Seat ${t.seat.number} | KES ${t.price} | ${buyer} | created ${new Date(t.createdAt).toISOString()}${hold}`
      );
    }
  }

  console.log(`\nTotal: ${rows.length}`);
  await disconnectDB();
  process.exit(0);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});