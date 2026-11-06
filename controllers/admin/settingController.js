import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import Setting from "../../models/Setting.js";

export const list = asyncHandler(async (req, res) => {
  const rows = await Setting.find().sort({ key: 1 }).lean();
  ok(res, rows);
});

export const bulkUpdate = asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [];
  const ops = items.map((item) => ({
    updateOne: {
      filter: { key: item.key },
      update: {
        $set: {
          value: item.value,
          group: item.group || item.key.split(".")[0] || "misc",
          updatedBy: req.admin._id,
        },
      },
      upsert: true,
    },
  }));

  if (ops.length) await Setting.bulkWrite(ops);
  const rows = await Setting.find().sort({ key: 1 }).lean();
  ok(res, rows);
});