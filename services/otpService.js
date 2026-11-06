import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import env from "../config/env.js";
import OTP from "../models/OTP.js";
import * as emailService from "./emailService.js";
import * as smsService from "./smsService.js";
import { detectChannel, normalizeIdentifier } from "../utils/identifier.js";
import { ApiError } from "../utils/apiError.js";

const generateCode = (length) =>
  Array.from({ length }, () => crypto.randomInt(0, 10)).join("");

const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

export const request = async ({ identifier }) => {
  const norm = normalizeIdentifier(identifier);
  if (!norm) throw ApiError.badRequest("Invalid phone or email", "INVALID_IDENTIFIER");

  await OTP.deleteMany({ identifier: norm.value, consumedAt: null });

  const code = generateCode(env.OTP_LENGTH);
  const codeHash = sha(code);
  const expiresAt = new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000);

  await OTP.create({
    identifier: norm.value,
    channel: norm.channel,
    codeHash,
    expiresAt,
  });

  const payload = { code, ttlMinutes: env.OTP_TTL_MINUTES };

  if (norm.channel === "email") {
    await emailService.sendOtp(norm.value, payload);
  } else {
    await smsService.sendOtp(norm.value, payload);
  }

  return { channel: norm.channel, expiresIn: env.OTP_TTL_MINUTES };
};

export const verify = async ({ identifier, code }) => {
  const norm = normalizeIdentifier(identifier);
  if (!norm) throw ApiError.badRequest("Invalid identifier", "INVALID_IDENTIFIER");

  const record = await OTP.findOne({
    identifier: norm.value,
    consumedAt: null,
  }).sort({ createdAt: -1 });

  if (!record) throw ApiError.badRequest("No active code. Request a new one.", "OTP_NOT_FOUND");

  if (record.expiresAt.getTime() < Date.now()) {
    await OTP.deleteOne({ _id: record._id });
    throw ApiError.badRequest("Code expired. Request a new one.", "OTP_EXPIRED");
  }

  if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
    await OTP.deleteOne({ _id: record._id });
    throw ApiError.tooMany("Too many attempts. Request a new code.", "OTP_MAX_ATTEMPTS");
  }

  if (record.codeHash !== sha(String(code))) {
    record.attempts += 1;
    await record.save();
    throw ApiError.badRequest("Invalid code", "OTP_INVALID");
  }

  record.consumedAt = new Date();
  await record.save();

  return { identifier: norm.value, channel: norm.channel };
};