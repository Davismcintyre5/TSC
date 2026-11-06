import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok, paginated } from "../../utils/response.js";
import { ApiError } from "../../utils/apiError.js";
import Ticket from "../../models/Ticket.js";

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [data, total] = await Promise.all([
    Ticket.find(filter)
      .populate("categoryId", "name section tier price")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Ticket.countDocuments(filter),
  ]);

  paginated(res, data, { page, limit, total });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["held", "paid", "used", "void"];
  if (!allowed.includes(status)) throw ApiError.badRequest("Invalid status");

  const patch = { status };
  if (status === "used") patch.usedAt = new Date();
  if (status === "paid") patch.paidAt = new Date();

  const row = await Ticket.findByIdAndUpdate(req.params.id, { $set: patch }, { new: true }).lean();
  if (!row) throw ApiError.notFound("Ticket not found");
  ok(res, row);
});