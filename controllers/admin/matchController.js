import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import { ApiError } from "../../utils/apiError.js";
import Match from "../../models/Match.js";

export const get = asyncHandler(async (req, res) => {
  const match = await Match.findOne({ singleton: "main" }).lean();
  if (!match) throw ApiError.notFound("Match not configured");
  ok(res, match);
});

export const update = asyncHandler(async (req, res) => {
  const match = await Match.findOneAndUpdate(
    { singleton: "main" },
    { $set: req.body },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
  ok(res, match);
});