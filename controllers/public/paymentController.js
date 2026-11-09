import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import { ApiError } from "../../utils/apiError.js";
import { logger } from "../../utils/logger.js";
import Payment from "../../models/Payment.js";
import Ticket from "../../models/Ticket.js";
import PriceCategory from "../../models/PriceCategory.js";
import Admin from "../../models/Admin.js";
import * as paystack from "../../services/payments/paystackService.js";
import * as cardService from "../../services/payments/cardService.js";
import * as bankService from "../../services/payments/bankService.js";
import * as emailService from "../../services/emailService.js";
import * as smsService from "../../services/smsService.js";
import { generate as generateQr } from "../../services/qrService.js";

const GATES = ["A", "B", "C", "D", "E", "F", "G", "H"];
const randomGate = () => GATES[Math.floor(Math.random() * GATES.length)];

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

const notifyAdmins = (payment, tickets) => {
  Admin.find({ isActive: true })
    .select("email")
    .lean()
    .then((admins) => {
      if (!admins.length) return;
      const summary = {
        matchName: "Bayern Munich vs Ajax",
        amount: payment.amount,
        method: payment.method,
        reference: payment.paystack?.reference || String(payment._id),
        mpesaReceipt: payment.paystack?.mpesaReceipt || null,
        buyerName: tickets[0]?.buyer?.name || null,
        buyerPhone: tickets[0]?.buyer?.phone || null,
        buyerEmail: tickets[0]?.buyer?.email || null,
        tickets: tickets.map((t) => ({
          section: t.seat.section,
          row: t.seat.row,
          number: t.seat.number,
        })),
        paymentId: String(payment._id),
        paidAt: new Date().toISOString(),
      };
      return Promise.allSettled(
        admins.map((a) =>
          emailService.sendAdminPaymentPaid(a.email, summary).catch((err) => {
            logger.warn({ err: err.message, email: a.email }, "Admin email failed");
          })
        )
      );
    })
    .catch((err) => {
      logger.error({ err: err.message }, "Admin notify lookup failed");
    });
};

const finalizePaid = async (payment) => {
  if (payment.status === "paid") return;
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

  notifyAdmins(payment, tickets);
};

// ---------------------------------------------------------------------------
// Hold
// ---------------------------------------------------------------------------

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
  const gate = randomGate();
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
      const seatNumber = startNumber ? String(startNumber + q) : String(fallbackCounter + q);
      const serial = `TSC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      try {
        const ticket = await Ticket.create({
          categoryId: cat._id,
          serial,
          seat: { section: baseSection, row: baseRow, number: seatNumber },
          price: cat.price,
          currency: cat.currency,
          qrCode: "",
          gate,
          status: "held",
          holdExpiresAt: holdUntil,
        });
        held.push(ticket);
      } catch (err) {
        if (err.code === 11000) {
          throw ApiError.conflict(
            `Seat ${seatNumber} in ${baseSection} row ${baseRow} is no longer available`,
            "SEAT_UNAVAILABLE"
          );
        }
        throw err;
      }
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
    seats: held.map((t) => ({ section: t.seat.section, row: t.seat.row, number: t.seat.number })),
    gate,
    holdExpiresAt: holdUntil,
  });
});

// ---------------------------------------------------------------------------
// Initiate (Paystack)
// ---------------------------------------------------------------------------

export const mpesaInitiate = asyncHandler(async (req, res) => {
  const { paymentId, phone, email, firstName, lastName } = req.body;
  if (!paymentId) throw ApiError.badRequest("paymentId required", "PAYMENT_ID_REQUIRED");
  if (!phone) throw ApiError.badRequest("Phone required", "PHONE_REQUIRED");
  if (!email) throw ApiError.badRequest("Email required", "EMAIL_REQUIRED");

  const payment = await Payment.findById(paymentId);
  if (!payment) throw ApiError.notFound("Payment not found");
  if (payment.status !== "pending") {
    throw ApiError.badRequest("Payment not pending", "PAYMENT_NOT_PENDING");
  }

  await attachBuyer(payment, { phone, email, firstName, lastName });

  const result = await paystack.initiateSTKPush({
    email: String(email).trim().toLowerCase(),
    phone,
    amountKES: payment.amount,
    reference: `TSC-${payment._id}-${Date.now()}`,
    metadata: { paymentId: String(payment._id) },
  });

  if (!result.success) {
    payment.status = "failed";
    await payment.save();
    throw ApiError.badRequest("Payment request failed", "PAYSTACK_FAILED", result.error);
  }

  payment.method = "mpesa";
  payment.paystack = {
    reference: result.reference,
    accessCode: result.accessCode,
    phone: paystack.normalizePhone(phone),
  };
  await payment.save();

  ok(res, {
    paymentId: payment._id,
    reference: result.reference,
    accessCode: result.accessCode,
    authorizationUrl: result.authorizationUrl,
  });
});

export const paystackInitiate = mpesaInitiate;

// ---------------------------------------------------------------------------
// Webhook
// ---------------------------------------------------------------------------

export const paystackWebhook = asyncHandler(async (req, res) => {
  const signature = req.get("x-paystack-signature");
  if (!paystack.verifyWebhookSignature(req.rawBody, signature)) {
    logger.warn({ signature }, "Paystack webhook signature invalid");
    return res.status(401).json({ success: false, message: "Invalid signature" });
  }

  const parsed = paystack.parseWebhook(req.body);
  if (!parsed.valid) {
    return res.status(200).json({ success: true, message: "Ignored malformed" });
  }

  res.status(200).json({ success: true, received: true });

  try {
    if (parsed.event === "charge.success") {
      const paymentId = parsed.metadata?.paymentId;
      if (!paymentId) return;

      const payment = await Payment.findById(paymentId);
      if (!payment || payment.status === "paid") return;

      const verify = await paystack.verifyTransaction(parsed.reference);
      if (!verify.success || verify.status !== "success") return;

      payment.paystack = {
        ...(payment.paystack || {}),
        reference: parsed.reference,
        mpesaReceipt: verify.authorization?.receipt_number || parsed.raw?.receipt_number || null,
        paidAt: new Date(),
      };
      await finalizePaid(payment);
      logger.info({ paymentId, reference: parsed.reference }, "Paystack paid");
    } else if (parsed.event === "charge.failed") {
      const paymentId = parsed.metadata?.paymentId;
      if (paymentId) await Payment.findByIdAndUpdate(paymentId, { status: "failed" });
    }
  } catch (err) {
    logger.error({ err: err.message, reference: parsed.reference }, "Paystack webhook error");
  }
});

// ---------------------------------------------------------------------------
// Verify + callback alias
// ---------------------------------------------------------------------------

export const paystackVerify = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  if (!reference) throw ApiError.badRequest("reference required", "REFERENCE_REQUIRED");

  const payment = await Payment.findOne({ "paystack.reference": reference });
  if (!payment) throw ApiError.notFound("Payment not found for reference");

  const verify = await paystack.verifyTransaction(reference);
  if (!verify.success) {
    throw ApiError.badRequest("Paystack verify failed", "PAYSTACK_VERIFY_FAILED", verify.error);
  }

  if (verify.status === "success" && payment.status !== "paid") {
    payment.paystack = {
      ...(payment.paystack || {}),
      reference,
      mpesaReceipt: verify.authorization?.receipt_number || null,
      paidAt: new Date(),
    };
    await finalizePaid(payment);
  }

  ok(res, {
    paymentId: payment._id,
    reference,
    status: payment.status,
    paystackStatus: verify.status,
    amount: verify.amount,
    currency: verify.currency,
    channel: verify.channel,
    paidAt: verify.paidAt,
  });
});

export const paystackCallback = asyncHandler(async (req, res) => {
  const reference = req.query.reference || req.query.trxref;
  if (!reference) throw ApiError.badRequest("reference required", "REFERENCE_REQUIRED");
  req.params.reference = reference;
  return paystackVerify(req, res);
});

// ---------------------------------------------------------------------------
// Card (Stripe)
// ---------------------------------------------------------------------------

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
        payment.card.last4 = event.data.object.charges?.data?.[0]?.payment_method_details?.card?.last4 || null;
        payment.card.brand = event.data.object.charges?.data?.[0]?.payment_method_details?.card?.brand || null;
        await finalizePaid(payment);
      }
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentId = event.data.object.metadata?.paymentId;
    if (paymentId) await Payment.findByIdAndUpdate(paymentId, { status: "failed" });
  }

  res.json({ received: true });
});

// ---------------------------------------------------------------------------
// Bank
// ---------------------------------------------------------------------------

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
      .sendBankAwaiting(email, { matchName: "Bayern Munich vs Ajax", reference, bank: instructions })
      .catch(() => {});
  } else if (phone) {
    await smsService
      .sendBankAwaiting(phone, { matchName: "Bayern Munich vs Ajax", reference })
      .catch(() => {});
  }

  ok(res, { paymentId: payment._id, reference, instructions });
});

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export const paymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) {
    throw ApiError.badRequest("Invalid payment id", "INVALID_PAYMENT_ID");
  }

  const payment = await Payment.findById(id).lean();
  if (!payment) throw ApiError.notFound("Payment not found");

  ok(res, {
    _id: payment._id,
    status: payment.status,
    method: payment.method,
    amount: payment.amount,
    currency: payment.currency,
  });
});