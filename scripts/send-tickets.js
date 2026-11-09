import "./dnsSet.js";
import "dotenv/config";

import { connectDB, disconnectDB } from "../config/db.js";
import Ticket from "../models/Ticket.js";
import Payment from "../models/Payment.js";
import Admin from "../models/Admin.js";
import * as emailService from "../services/emailService.js";
import * as smsService from "../services/smsService.js";

const SERIALS = [
  "TSC-1794155136863-NK0WIF",
  "TSC-1794155136581-ZGDS96",
];

const sendBuyer = async (ticket) => {
  const payload = {
    matchName: "Bayern Munich vs Ajax",
    gate: ticket.gate,
    seat: `${ticket.seat.number} · Row ${ticket.seat.row}`,
    qrUrl: `${process.env.APP_ORIGIN}/tickets`,
  };

  if (ticket.buyer?.channel === "email" && ticket.buyer?.email) {
    await emailService.sendTicketReady(ticket.buyer.email, payload);
    console.log(`✔ buyer email → ${ticket.buyer.email} (${ticket.serial})`);
  } else if (ticket.buyer?.channel === "sms" && ticket.buyer?.phone) {
    await smsService.sendTicketReady(ticket.buyer.phone, payload);
    console.log(`✔ buyer sms → ${ticket.buyer.phone} (${ticket.serial})`);
  } else if (ticket.buyer?.email) {
    await emailService.sendTicketReady(ticket.buyer.email, payload);
    console.log(`✔ buyer email → ${ticket.buyer.email} (${ticket.serial})`);
  } else if (ticket.buyer?.phone) {
    await smsService.sendTicketReady(ticket.buyer.phone, payload);
    console.log(`✔ buyer sms → ${ticket.buyer.phone} (${ticket.serial})`);
  } else {
    console.log(`⚠ no buyer contact on ${ticket.serial}`);
  }
};

const notifyAdmins = async (payment, tickets) => {
  const admins = await Admin.find({ isActive: true }).select("email").lean();
  if (!admins.length) {
    console.log("⚠ no active admins to notify");
    return;
  }

  const summary = {
    matchName: "Bayern Munich vs Ajax",
    amount: payment?.amount ?? tickets.reduce((s, t) => s + t.price, 0),
    method: payment?.method || "unknown",
    reference: payment?.paystack?.reference || String(payment?._id || ""),
    mpesaReceipt: payment?.paystack?.mpesaReceipt || null,
    buyerName: tickets[0]?.buyer?.name || null,
    buyerPhone: tickets[0]?.buyer?.phone || null,
    buyerEmail: tickets[0]?.buyer?.email || null,
    tickets: tickets.map((t) => ({
      section: t.seat.section,
      row: t.seat.row,
      number: t.seat.number,
    })),
    paymentId: payment ? String(payment._id) : null,
    paidAt: new Date().toISOString(),
  };

  for (const admin of admins) {
    try {
      await emailService.sendAdminPaymentPaid(admin.email, summary);
      console.log(`✔ admin email → ${admin.email}`);
    } catch (e) {
      console.error(`✖ admin email failed ${admin.email}:`, e.message);
    }
  }
};

const main = async () => {
  await connectDB();

  const tickets = await Ticket.find({ serial: { $in: SERIALS } });

  if (!tickets.length) {
    console.log("No matching tickets.");
    await disconnectDB();
    process.exit(0);
  }

  for (const ticket of tickets) {
    if (ticket.status !== "paid" && ticket.status !== "used") {
      console.log(`⚠ ${ticket.serial} not paid — skipping`);
      continue;
    }
    try {
      await sendBuyer(ticket);
    } catch (e) {
      console.error(`✖ buyer send failed ${ticket.serial}:`, e.message);
    }
  }

  const paymentIds = [...new Set(tickets.map((t) => t.paymentId).filter(Boolean))];
  for (const pid of paymentIds) {
    const payment = await Payment.findById(pid).lean();
    if (!payment) {
      console.log(`⚠ payment ${pid} not found`);
      continue;
    }
    const paymentTickets = await Ticket.find({ _id: { $in: payment.ticketIds } }).lean();
    await notifyAdmins(payment, paymentTickets);
  }

  await disconnectDB();
  process.exit(0);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});