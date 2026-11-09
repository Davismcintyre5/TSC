import "./dnsSet.js";
import "dotenv/config";

import { connectDB, disconnectDB } from "../config/db.js";
import Ticket from "../models/Ticket.js";
import Payment from "../models/Payment.js";
import { generate as generateQr } from "../services/qrService.js";

const SERIALS = [
  "TSC-1794155136863-NK0WIF",
  "TSC-1794155136581-ZGDS96",
];

const main = async () => {
  await connectDB();

  const tickets = await Ticket.find({ serial: { $in: SERIALS } });
  if (!tickets.length) {
    console.log("No matching tickets.");
    await disconnectDB();
    process.exit(0);
  }

  const paymentIds = [...new Set(tickets.map((t) => t.paymentId).filter(Boolean))];

  await Ticket.updateMany(
    { serial: { $in: SERIALS } },
    { $set: { status: "paid", paidAt: new Date() } }
  );

  for (const t of tickets) {
    const fresh = await Ticket.findById(t._id);
    if (!fresh.qrCode) {
      fresh.qrCode = await generateQr(fresh.serial);
      await fresh.save();
    }
    console.log(
      "✔ paid:", fresh.serial,
      "| seat", fresh.seat.number,
      "| row", fresh.seat.row,
      "| gate", fresh.gate
    );
  }

  if (paymentIds.length) {
    await Payment.updateMany(
      { _id: { $in: paymentIds } },
      { $set: { status: "paid", "paystack.paidAt": new Date() } }
    );
    console.log("✔ payments marked paid:", paymentIds.map(String).join(", "));
  } else {
    console.log("⚠ no paymentId on tickets — payment not updated");
  }

  await disconnectDB();
  process.exit(0);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});