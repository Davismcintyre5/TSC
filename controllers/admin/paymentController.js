import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok, paginated } from "../../utils/response.js";
import { ApiError } from "../../utils/apiError.js";
import Payment from "../../models/Payment.js";
import Ticket from "../../models/Ticket.js";
import * as bankService from "../../services/payments/bankService.js";
import * as emailService from "../../services/emailService.js";
import * as smsService from "../../services/smsService.js";
import { generate as generateQr } from "../../services/qrService.js";

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const filter = {};
  if (req.query.method) filter.method = req.query.method;
  if (req.query.status) filter.status = req.query.status;

  const [data, total] = await Promise.all([
    Payment.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Payment.countDocuments(filter),
  ]);

  paginated(res, data, { page, limit, total });
});

export const get = asyncHandler(async (req, res) => {
  const row = await Payment.findById(req.params.id).lean();
  if (!row) throw ApiError.notFound("Payment not found");
  ok(res, row);
});

export const confirmBank = asyncHandler(async (req, res) => {
  const payment = await bankService.confirm({ paymentId: req.params.id, adminId: req.admin._id });

  const tickets = await Ticket.find({ _id: { $in: payment.ticketIds } });
  for (const ticket of tickets) {
    ticket.status = "paid";
    ticket.paidAt = new Date();
    if (!ticket.qrCode) ticket.qrCode = await generateQr(ticket.serial);
    await ticket.save();

    const payload = {
      matchName: "Bayern Munich vs Ajax",
      gate: ticket.gate,
      seat: `${ticket.seat.number} · Row ${ticket.seat.row}`,
      qrUrl: `${process.env.APP_ORIGIN}/tickets/${ticket._id}`,
    };
    if (ticket.buyer.channel === "email") {
      await emailService.sendTicketReady(ticket.buyer.identifier, payload);
    } else {
      await smsService.sendTicketReady(ticket.buyer.identifier, payload);
    }
  }

  ok(res, payment);
});