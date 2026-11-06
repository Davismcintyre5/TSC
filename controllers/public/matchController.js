import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import { ApiError } from "../../utils/apiError.js";
import Match from "../../models/Match.js";
import PriceCategory from "../../models/PriceCategory.js";
import Ticket from "../../models/Ticket.js";

export const getMatch = asyncHandler(async (req, res) => {
  const match = await Match.findOne({ singleton: "main" }).lean();
  if (!match) throw ApiError.notFound("Match not configured");
  ok(res, { ...match, serverTime: new Date().toISOString() });
});

export const listCategories = asyncHandler(async (req, res) => {
  const rows = await PriceCategory.find({ isActive: true }).sort({ order: 1 }).lean();

  const soldByCat = await Ticket.aggregate([
    { $match: { status: { $in: ["paid", "used"] } } },
    { $group: { _id: "$categoryId", sold: { $sum: 1 } } },
  ]);

  const soldMap = Object.fromEntries(
    soldByCat.map((r) => [String(r._id), r.sold])
  );

  const withSeats = rows.map((c) => {
    const capacity = c.capacity || 0;
    const sold = soldMap[String(c._id)] || 0;
    return {
      ...c,
      seatsLeft: capacity > 0 ? Math.max(0, capacity - sold) : null,
    };
  });

  ok(res, withSeats);
});