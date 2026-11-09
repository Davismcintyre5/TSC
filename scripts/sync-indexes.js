import "./dnsSet.js";
import "dotenv/config";

import { connectDB, disconnectDB } from "../config/db.js";
import Ticket from "../models/Ticket.js";

const TAKEN = ["held", "paid", "used"];

const main = async () => {
  await connectDB();

  console.log("\n🔍 Checking for duplicate seats…");

  const dupes = await Ticket.aggregate([
    { $match: { status: { $in: TAKEN } } },
    {
      $group: {
        _id: {
          section: "$seat.section",
          row: "$seat.row",
          number: "$seat.number",
        },
        count: { $sum: 1 },
        docs: {
          $push: {
            id: "$_id",
            serial: "$serial",
            status: "$status",
            createdAt: "$createdAt",
          },
        },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  if (dupes.length === 0) {
    console.log("✔ No duplicate seats found");
  } else {
    console.log(`⚠ Found ${dupes.length} duplicate seat group(s):\n`);

    for (const g of dupes) {
      const seat = `${g._id.section} · Row ${g._id.row} · Seat ${g._id.number}`;
      console.log(`  ${seat}`);

      const sorted = [...g.docs].sort((a, b) => {
        const priority = { paid: 0, used: 0, held: 1 };
        const pa = priority[a.status] ?? 2;
        const pb = priority[b.status] ?? 2;
        if (pa !== pb) return pa - pb;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      const keep = sorted[0];
      const drop = sorted.slice(1).map((d) => d.id);

      console.log(`    keep: ${keep.serial} (${keep.status})`);
      for (const d of sorted.slice(1)) {
        console.log(`    void: ${d.serial} (${d.status})`);
      }

      await Ticket.updateMany(
        { _id: { $in: drop } },
        { $set: { status: "void" } }
      );
    }

    console.log(`\n✔ Voided duplicate tickets`);
  }

  console.log("\n🔧 Syncing indexes…");
  try {
    await Ticket.syncIndexes();
    console.log("✔ Indexes synced");
  } catch (e) {
    console.error("✖ syncIndexes failed:", e.message);
    await disconnectDB();
    process.exit(1);
  }

  const idx = await Ticket.collection.indexes();
  console.log("\n📋 Ticket indexes:");
  for (const i of idx) {
    const flag = i.unique ? " [unique]" : "";
    console.log(`  ${i.name}${flag}`);
  }

  await disconnectDB();
  process.exit(0);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});