import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import { ApiError } from "../../utils/apiError.js";
import Match from "../../models/Match.js";
import PriceCategory from "../../models/PriceCategory.js";
import Ticket from "../../models/Ticket.js";

const LEVEL_META = {
  L1: { title: "Level 1", range: "Sections 101–128" },
  L2: { title: "Level 2", range: "Sections 201–220" },
  L3: { title: "Level 3", range: "Sections 401–435" },
  gold: { title: "Gold", range: "5 sections" },
  platinum: { title: "Platinum", range: "5 sections" },
  skybox: { title: "Skyboxes", range: "Boxes 301–350" },
  accessible: { title: "Accessible", range: "28 sections" },
};

const LEVEL_ORDER = ["L1", "L2", "L3", "gold", "platinum", "skybox", "accessible"];

const TAKEN_STATUSES = ["held", "paid", "used"];
const MAX_SEATS_PER_ROW = 30;

export const getMatch = asyncHandler(async (req, res) => {
  const match = await Match.findOne({ singleton: "main" }).lean();
  if (!match) throw ApiError.notFound("Match not configured");
  ok(res, { ...match, serverTime: new Date().toISOString() });
});

export const listCategories = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.level) filter.level = req.query.level;

  const rows = await PriceCategory.find(filter).sort({ phase: 1, order: 1 }).lean();

  const soldByCat = await Ticket.aggregate([
    { $match: { status: { $in: ["paid", "used"] } } },
    { $group: { _id: "$categoryId", sold: { $sum: 1 } } },
  ]);
  const soldMap = Object.fromEntries(soldByCat.map((r) => [String(r._id), r.sold]));

  const withSeats = rows.map((c) => ({
    ...c,
    seatsLeft: c.capacity > 0 ? Math.max(0, c.capacity - (soldMap[String(c._id)] || 0)) : null,
  }));

  ok(res, withSeats);
});

export const listLevels = asyncHandler(async (req, res) => {
  const rows = await PriceCategory.find().lean();

  const soldByCat = await Ticket.aggregate([
    { $match: { status: { $in: ["paid", "used"] } } },
    { $group: { _id: "$categoryId", sold: { $sum: 1 } } },
  ]);
  const soldMap = Object.fromEntries(soldByCat.map((r) => [String(r._id), r.sold]));

  const groups = {};
  for (const c of rows) {
    if (!groups[c.level]) {
      const meta = LEVEL_META[c.level] || { title: c.level, range: "" };
      groups[c.level] = {
        level: c.level,
        title: meta.title,
        range: meta.range,
        seatsLeft: 0,
        from: null,
        active: false,
        status: "available",
      };
    }
    const g = groups[c.level];

    const sold = soldMap[String(c._id)] || 0;
    const seats = c.capacity > 0 ? Math.max(0, c.capacity - sold) : 0;
    g.seatsLeft += seats;

    if (c.isActive) {
      g.active = true;
      if (c.price > 0) {
        g.from = g.from == null ? c.price : Math.min(g.from, c.price);
      }
    }
  }

  const list = LEVEL_ORDER.filter((k) => groups[k]).map((k) => {
    const g = groups[k];
    return {
      ...g,
      status: g.active ? "available" : "soon",
    };
  });

  ok(res, list);
});

export const listSeats = asyncHandler(async (req, res) => {
  const { level, section, row } = req.query;
  if (!level || !section || !row) {
    throw ApiError.badRequest("level, section, row required", "MISSING_PARAMS");
  }

  const sectionKey = `${level} · Section ${section}`;

  const category = await PriceCategory.findOne({ level }).lean();
  const maxSeats =
    category?.capacity > 0
      ? Math.min(MAX_SEATS_PER_ROW, category.capacity)
      : MAX_SEATS_PER_ROW;

  const now = new Date();

  const taken = await Ticket.find({
    "seat.section": sectionKey,
    "seat.row": String(row),
    status: { $in: TAKEN_STATUSES },
    $or: [
      { status: { $ne: "held" } },
      { holdExpiresAt: { $gt: now } },
    ],
  })
    .select("seat.number status holdExpiresAt")
    .lean();

  const takenMap = {};
  for (const t of taken) {
    takenMap[t.seat.number] = t.status;
  }

  const allNumbers = Array.from({ length: maxSeats }, (_, i) => String(i + 1));
  const available = allNumbers.filter((n) => !takenMap[n]);

  ok(res, {
    level,
    section: String(section),
    row: String(row),
    maxSeats,
    total: allNumbers.length,
    taken: Object.entries(takenMap).map(([number, status]) => ({ number, status })),
    available,
  });
});