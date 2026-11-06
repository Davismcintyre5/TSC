import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import Setting from "../../models/Setting.js";

const PUBLIC_KEYS = {
  brand: ["brand.name", "brand.logoUrl", "brand.faviconUrl"],
  contact: [
    "contact.supportPhone",
    "contact.email",
    "contact.hospitalityEmail",
    "contact.pressEmail",
    "contact.address",
  ],
  social: [
    "social.twitter",
    "social.instagram",
    "social.facebook",
    "social.tiktok",
    "social.youtube",
  ],
};

export const publicSettings = asyncHandler(async (req, res) => {
  const allKeys = Object.values(PUBLIC_KEYS).flat();
  const rows = await Setting.find({ key: { $in: allKeys } }).lean();

  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const out = { brand: {}, contact: {}, social: {} };

  for (const [group, keys] of Object.entries(PUBLIC_KEYS)) {
    for (const key of keys) {
      const short = key.split(".")[1];
      out[group][short] = map[key] ?? null;
    }
  }

  res.set("Cache-Control", "public, max-age=300");
  ok(res, out);
});