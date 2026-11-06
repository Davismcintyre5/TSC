import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import Ticket from "../../models/Ticket.js";
import PriceCategory from "../../models/PriceCategory.js";

export const me = asyncHandler(async (req, res) => {
  ok(res, { identifier: req.user.identifier });
});

export const listTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ "buyer.identifier": req.user.identifier })
    .populate("categoryId", "name section tier price currency")
    .sort({ createdAt: -1 })
    .lean();
  ok(res, tickets);
});