import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import { ApiError } from "../../utils/apiError.js";
import Ticket from "../../models/Ticket.js";
import Match from "../../models/Match.js";
import Setting from "../../models/Setting.js";
import { generate as generateQr } from "../../services/qrService.js";
import { generateTicketPdf } from "../../services/ticketPdfService.js";
import { generateTicketPng } from "../../services/ticketPngService.js";

export const me = asyncHandler(async (req, res) => {
  ok(res, { identifier: req.user.identifier });
});

export const listTickets = asyncHandler(async (req, res) => {
  const id = req.user.identifier;
  const tickets = await Ticket.find({
    $or: [
      { "buyer.identifier": id },
      { "buyer.email": id },
      { "buyer.phone": id },
    ],
  })
    .populate("categoryId", "name section tier price currency")
    .sort({ createdAt: -1 })
    .lean();
  ok(res, tickets);
});

const loadTicketPayload = async (req) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate("categoryId", "name section tier price currency")
    .lean();

  if (!ticket) throw ApiError.notFound("Ticket not found");

  const id = req.user.identifier;
  const owns =
    ticket.buyer?.identifier === id ||
    ticket.buyer?.email === id ||
    ticket.buyer?.phone === id;

  if (!owns) throw ApiError.forbidden("Not your ticket", "NOT_YOUR_TICKET");
  if (!["paid", "used"].includes(ticket.status)) {
    throw ApiError.badRequest("Ticket not paid", "TICKET_NOT_PAID");
  }

  const match = await Match.findOne({ singleton: "main" }).lean();
  if (!match) throw ApiError.notFound("Match not configured");

  const logoRow = await Setting.findOne({ key: "brand.logoUrl" }).lean();
  const logoUrl = logoRow?.value || null;

  const qrDataUrl = ticket.qrCode || (await generateQr(ticket.serial));

  return {
    ticket,
    match,
    category: ticket.categoryId,
    logoUrl,
    qrDataUrl,
  };
};

export const downloadPdf = asyncHandler(async (req, res) => {
  const payload = await loadTicketPayload(req);
  const buf = await generateTicketPdf(payload);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="TSC-${payload.ticket.serial}.pdf"`
  );
  res.setHeader("Content-Length", buf.length);
  res.send(buf);
});

export const downloadPng = asyncHandler(async (req, res) => {
  const payload = await loadTicketPayload(req);
  const buf = await generateTicketPng(payload);

  res.setHeader("Content-Type", "image/png");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="TSC-${payload.ticket.serial}.png"`
  );
  res.setHeader("Content-Length", buf.length);
  res.send(buf);
});