import { asyncHandler } from "../../utils/asyncHandler.js";
import { paginated } from "../../utils/response.js";
import NotifyEmail from "../../models/NotifyEmail.js";

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const filter = {};
  if (req.query.confirmed === "true") filter.confirmed = true;
  if (req.query.confirmed === "false") filter.confirmed = false;
  if (req.query.q) filter.email = { $regex: String(req.query.q), $options: "i" };

  const [data, total] = await Promise.all([
    NotifyEmail.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    NotifyEmail.countDocuments(filter),
  ]);

  paginated(res, data, { page, limit, total });
});