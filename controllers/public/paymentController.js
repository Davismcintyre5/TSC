import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import { ApiError } from "../../utils/apiError.js";
import { logger } from "../../utils/logger.js";
import Payment from "../../models/Payment.js";
import Ticket from "../../models/Ticket.js";
import PriceCategory from "../../models/PriceCategory.js";
import * as mpesa from "../../services/payments/mpesaService.js";
import * as cardService from "../../services/payments/cardService.js";
import * as bankService from "../../services/payments/bankService.js";
import * as emailService from "../../services/emailService.js";
import * as smsService from "../../services/smsService.js";
import { generate as generateQr } from "../../services/qrService.js";

const attachBuyer = async (payment, buyer) => {
  if (!buyer) return;
  const email = (buyer.email || "").trim().toLowerCase();
  const phone = (buyer.phone || "").trim();
  const name = `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim();
  const identifier = email || phone;
  const channel = email ? "email" : "sms";

  if (!identifier) return;

  await Ticket.updateMany(
    { _id: { $in: payment.ticketIds } },
    {
      $set: {
        "buyer.identifier": identifier,
        "buyer.channel": channel,
        "buyer.name": name,
        "buyer.phone": phone,
        "buyer.email": email,
      },
    }
  );
};

const finalizePaid = async (payment) => {
  payment.status = "paid";
  await payment.save();

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
      qrUrl: `${process.env.APP_ORIGIN}/tickets`,
    };
    if (ticket.buyer.channel === "email" && ticket.buyer.email) {
      await emailService.sendTicketReady(ticket.buyer.email, payload).catch(() => {});
    } else if (ticket.buyer.channel === "sms" && ticket.buyer.phone) {
      await smsService.sendTicketReady(ticket.buyer.phone, payload).catch(() => {});
    }
  }
};

export const holdTickets = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    throw ApiError.badRequest("No items", "ITEMS_REQUIRED");
  }

  const categories = await PriceCategory.find({
    _id: { $in: items.map((i) => i.categoryId) },
  });
  const catMap = Object.fromEntries(categories.map((c) => [String(c._id), c]));

  const held = [];
  let total = 0;
  const holdUntil = new Date(Date.now() + 15 * 60 * 1000);
  let fallbackCounter = 1;

  for (const item of items) {
    const cat = catMap[String(item.categoryId)];
    if (!cat || !cat.isActive) {
      throw ApiError.badRequest("Invalid category", "CATEGORY_INVALID");
    }

    const qty = item.quantity || 1;
    total += cat.price * qty;

    const explicit = item.seat || null;
    const startNumber = explicit?.number ? Number(explicit.number) : null;
    const baseSection = explicit?.section || cat.section;
    const baseRow = explicit?.row || "12";

    for (let q = 0; q < qty; q++) {
      const seatNumber = startNumber
        ? String(startNumber + q)
        : String(fallbackCounter + q);

      const serial = `TSC-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

      const ticket = await Ticket.create({
        categoryId: cat._id,
        serial,
        seat: { section: baseSection, row: baseRow, number: seatNumber },
        price: cat.price,
        currency: cat.currency,
        qrCode: "",
        gate: "A",
        status: "held",
        holdExpiresAt: holdUntil,
      });
      held.push(ticket);
    }

    fallbackCounter += qty;
  }

  const payment = await Payment.create({
    ticketIds: held.map((t) => t._id),
    amount: total,
    method: "mpesa",
    status: "pending",
  });

  await Ticket.updateMany(
    { _id: { $in: held.map((t) => t._id) } },
    { paymentId: payment._id }
  );

  ok(res, {
    paymentId: payment._id,
    amount: total,
    currency: "KES",
    ticketIds: held.map((t) => t._id),
    seats: held.map((t) => ({
      section: t.seat.section,
      row: t.seat.row,
      number: t.seat.number,
    })),
    holdExpiresAt: holdUntil,
  });
});

export const mpesaInitiate = asyncHandler(async (req, res) => {
  const { paymentId, phone, email, firstName, lastName } = req.body;
  const payment = await Payment.findById(paymentId);
  if (!payment) throw ApiError.notFound("Payment not found");
  if (payment.status !== "pending") throw ApiError.badRequest("Payment not pending");

  if (!phone) throw ApiError.badRequest("Phone required", "PHONE_REQUIRED");

  await attachBuyer(payment, { phone, email, firstName, lastName });

  const normPhone = mpesa.normalizePhone(phone);

  const result = await mpesa.initiateSTKPush({
    phone: normPhone,
    amount: payment.amount,
    accountReference: "Talanta",
    description: "Tickets",
  });

  if (!result.success) {
    payment.status = "failed";
    await payment.save();
    throw ApiError.badRequest("M-Pesa request failed", "MPESA_FAILED", result.error);
  }

  payment.mpesa = {
    checkoutRequestId: result.checkoutRequestId,
    merchantRequestId: result.merchantRequestId,
    phone: normPhone,
  };
  await payment.save();

  ok(res, {
    paymentId: payment._id,
    checkoutRequestId: result.checkoutRequestId,
    customerMessage: result.customerMessage,
  });
});

export const mpesaCallback = asyncHandler(async (req, res) => {
  const data = mpesa.parseCallback(req.body);

  if (mpesa.isDuplicateCallback(data.checkoutRequestId)) {
    logger.info({ checkoutRequestId: data.checkoutRequestId }, "M-Pesa duplicate ignored");
    return res.json({ success: true, message: "Duplicate ignored" });
  }

  const payment = await Payment.findOne({
    "mpesa.checkoutRequestId": data.checkoutRequestId,
  });
  if (!payment) {
    logger.warn({ checkoutRequestId: data.checkoutRequestId }, "Payment not found for callback");
    return res.json({ success: true, message: "No matching payment" });
  }

  if (!data.success) {
    payment.status = "failed";
    await payment.save();
    return res.json({ success: true });
  }

  payment.mpesa.mpesaReceipt = data.mpesaReceiptNumber;
  await finalizePaid(payment);

  logger.info(
    { checkoutRequestId: data.checkoutRequestId, receipt: data.mpesaReceiptNumber },
    "M-Pesa paid"
  );
  res.json({ success: true });
});

export const cardIntent = asyncHandler(async (req, res) => {
  const { paymentId, email, firstName, lastName, phone } = req.body;
  const payment = await Payment.findById(paymentId);
  if (!payment) throw ApiError.notFound("Payment not found");
  if (payment.status !== "pending") throw ApiError.badRequest("Payment not pending");

  await attachBuyer(payment, { phone, email, firstName, lastName });

  const intent = await cardService.createIntent({
    amount: payment.amount,
    metadata: { paymentId: String(payment._id) },
  });

  payment.method = "card";
  payment.card = { providerRef: intent.id };
  await payment.save();

  ok(res, intent);
});

export const cardWebhook = asyncHandler(async (req, res) => {
  const sig = req.get("stripe-signature");
  const event = cardService.verifyWebhook(req.body, sig);

  if (event.type === "payment_intent.succeeded") {
    const paymentId = event.data.object.metadata?.paymentId;
    if (paymentId) {
      const payment = await Payment.findById(paymentId);
      if (payment && payment.status !== "paid") {
        payment.card.last4 =
          event.data.object.charges?.data?.[0]?.payment_method_details?.card?.last4 || null;
        payment.card.brand =
          event.data.object.charges?.data?.[0]?.payment_method_details?.card?.brand || null;
        await finalizePaid(payment);
      }
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentId = event.data.object.metadata?.paymentId;
    if (paymentId) {
      await Payment.findByIdAndUpdate(paymentId, { status: "failed" });
    }
  }

  res.json({ received: true });
});

export const bankInstructions = asyncHandler(async (req, res) => {
  const { paymentId, email, firstName, lastName, phone } = req.body;
  const payment = await Payment.findById(paymentId);
  if (!payment) throw ApiError.notFound("Payment not found");
  if (payment.status !== "pending") throw ApiError.badRequest("Payment not pending");

  await attachBuyer(payment, { phone, email, firstName, lastName });

  const reference = "TSC-" + Math.random().toString(36).slice(2, 10).toUpperCase();
  const instructions = bankService.getInstructions();

  payment.method = "bank";
  payment.status = "awaiting_confirmation";
  payment.bank = {
    reference,
    accountName: instructions.accountName,
    accountNumber: instructions.accountNumber,
    bankName: instructions.bankName,
  };
  await payment.save();

  if (email) {
    await emailService
      .sendBankAwaiting(email, {
        matchName: "Bayern Munich vs Ajax",
        reference,
        bank: instructions,
      })
      .catch(() => {});
  } else if (phone) {
    await smsService
      .sendBankAwaiting(phone, { matchName: "Bayern Munich vs Ajax", reference })
      .catch(() => {});
  }

  ok(res, { paymentId: payment._id, reference, instructions });
});

export const paymentStatus = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).lean();
  if (!payment) throw ApiError.notFound("Payment not found");
  ok(res, {
    _id: payment._id,
    status: payment.status,
    method: payment.method,
    amount: payment.amount,
    currency: payment.currency,
  });
});