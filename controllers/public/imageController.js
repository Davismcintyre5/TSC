import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import Image from "../../models/Image.js";

const PUBLIC_CATEGORIES = ["hero", "stadium", "hospitality", "logo"];

export const listImages = asyncHandler(async (req, res) => {
  const filter = { published: true };
  if (req.query.category) {
    if (!PUBLIC_CATEGORIES.includes(req.query.category)) {
      return ok(res, []);
    }
    filter.category = req.query.category;
  }

  const rows = await Image.find(filter)
    .sort({ category: 1, isPrimary: -1, order: 1 })
    .select("category label url width height format alt order isPrimary")
    .lean();

  const grouped = rows.reduce((acc, r) => {
    (acc[r.category] ||= []).push(r);
    return acc;
  }, {});

  ok(res, grouped);
});