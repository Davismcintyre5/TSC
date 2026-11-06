import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok, created } from "../../utils/response.js";
import { ApiError } from "../../utils/apiError.js";
import FAQ from "../../models/FAQ.js";

export const list = asyncHandler(async (req, res) => {
  const rows = await FAQ.find().sort({ order: 1 }).lean();
  ok(res, rows);
});

export const create = asyncHandler(async (req, res) => {
  const row = await FAQ.create(req.body);
  created(res, row);
});

export const update = asyncHandler(async (req, res) => {
  const row = await FAQ.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean();
  if (!row) throw ApiError.notFound("FAQ not found");
  ok(res, row);
});

export const remove = asyncHandler(async (req, res) => {
  const row = await FAQ.findByIdAndDelete(req.params.id);
  if (!row) throw ApiError.notFound("FAQ not found");
  ok(res, { deleted: true });
});