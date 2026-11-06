import crypto from "node:crypto";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import { ApiError } from "../../utils/apiError.js";
import NotifyEmail from "../../models/NotifyEmail.js";
import Match from "../../models/Match.js";
import * as emailService from "../../services/emailService.js";
import env from "../../config/env.js";

export const create = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw ApiError.badRequest("Email required", "EMAIL_REQUIRED");

  const existing = await NotifyEmail.findOne({ email: email.toLowerCase().trim() });
  if (existing && existing.confirmed) {
    return ok(res, { already: true });
  }

  const token = crypto.randomBytes(24).toString("hex");
  const record = await NotifyEmail.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { email: email.toLowerCase().trim(), token, confirmed: false, confirmedAt: null },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const match = await Match.findOne({ singleton: "main" }).lean();
  const matchName = match ? `${match.homeTeam} vs ${match.awayTeam}` : "the match";
  const confirmUrl = `${env.APP_ORIGIN}/notify/confirm?token=${record.token}`;

  await emailService.sendNotifyConfirm(record.email, { matchName, confirmUrl });

  ok(res, { sent: true });
});

export const confirm = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) throw ApiError.badRequest("Token required", "TOKEN_REQUIRED");

  const record = await NotifyEmail.findOneAndUpdate(
    { token, confirmed: false },
    { confirmed: true, confirmedAt: new Date() },
    { new: true }
  );
  if (!record) throw ApiError.badRequest("Invalid or used token", "TOKEN_INVALID");

  ok(res, { confirmed: true });
});