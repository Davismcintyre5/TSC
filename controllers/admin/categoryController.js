import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok, created } from "../../utils/response.js";
import { ApiError } from "../../utils/apiError.js";
import PriceCategory from "../../models/PriceCategory.js";

export const list = asyncHandler(async (req, res) => {
  const rows = await PriceCategory.find().sort({ order: 1 }).lean();
  ok(res, rows);
});

export const create = asyncHandler(async (req, res) => {
  const row = await PriceCategory.create(req.body);
  created(res, row);
});

export const update = asyncHandler(async (req, res) => {
  const row = await PriceCategory.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean();
  if (!row) throw ApiError.notFound("Category not found");
  ok(res, row);
});

export const remove = asyncHandler(async (req, res) => {
  const row = await PriceCategory.findByIdAndDelete(req.params.id);
  if (!row) throw ApiError.notFound("Category not found");
  ok(res, { deleted: true });
});