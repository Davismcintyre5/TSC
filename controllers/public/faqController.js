import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import FAQ from "../../models/FAQ.js";

export const listFaqs = asyncHandler(async (req, res) => {
  const rows = await FAQ.find({ isPublic: true })
    .sort({ category: 1, order: 1 })
    .lean();

  const grouped = rows.reduce((acc, row) => {
    (acc[row.category] ||= []).push(row);
    return acc;
  }, {});

  ok(res, grouped);
});