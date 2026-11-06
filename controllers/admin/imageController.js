import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok, created } from "../../utils/response.js";
import { ApiError } from "../../utils/apiError.js";
import Image from "../../models/Image.js";
import Setting from "../../models/Setting.js";
import * as cloudinaryService from "../../services/cloudinaryService.js";

const CATEGORIES = ["hero", "stadium", "hospitality", "logo"];

export const signature = asyncHandler(async (req, res) => {
  const { category } = req.body;
  if (!CATEGORIES.includes(category)) throw ApiError.badRequest("Invalid category");
  ok(res, cloudinaryService.signUpload({ category }));
});

export const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  const rows = await Image.find(filter).sort({ category: 1, order: 1 }).lean();
  ok(res, rows);
});

export const create = asyncHandler(async (req, res) => {
  const { category, publicId, url, width, height, format, bytes, label, alt, isPrimary } = req.body;
  if (!CATEGORIES.includes(category)) throw ApiError.badRequest("Invalid category");
  if (!publicId || !url) throw ApiError.badRequest("publicId and url required");

  const resource = await cloudinaryService.fetchResource(publicId);

  if (isPrimary && ["hero", "logo"].includes(category)) {
    await Image.updateMany({ category }, { $set: { isPrimary: false } });
  }

  const doc = await Image.create({
    category,
    publicId,
    url: resource.secure_url || url,
    width: resource.width || width,
    height: resource.height || height,
    format: resource.format || format,
    bytes: resource.bytes || bytes,
    label: label || "",
    alt: alt || "",
    isPrimary: !!isPrimary,
    uploadedBy: req.admin._id,
  });

  if (category === "logo") {
    await Image.updateMany(
      { category: "logo", _id: { $ne: doc._id } },
      { $set: { isPrimary: false } }
    );
    await Image.updateOne({ _id: doc._id }, { $set: { isPrimary: true } });

    await Setting.updateOne(
      { key: "brand.logoUrl" },
      { $set: { value: doc.url, group: "brand", updatedBy: req.admin._id } },
      { upsert: true }
    );
  }

  created(res, doc);
});

export const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const patch = { ...req.body };
  delete patch.publicId;

  const existing = await Image.findById(id);
  if (!existing) throw ApiError.notFound("Image not found");

  if (patch.isPrimary && ["hero", "logo"].includes(existing.category)) {
    await Image.updateMany({ category: existing.category }, { $set: { isPrimary: false } });
  }

  const doc = await Image.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();

  if (doc.category === "logo" && patch.isPrimary) {
    await Setting.updateOne(
      { key: "brand.logoUrl" },
      { $set: { value: doc.url, group: "brand", updatedBy: req.admin._id } },
      { upsert: true }
    );
  }

  ok(res, doc);
});

export const remove = asyncHandler(async (req, res) => {
  const doc = await Image.findById(req.params.id);
  if (!doc) throw ApiError.notFound("Image not found");

  await cloudinaryService.destroy(doc.publicId).catch(() => {});
  await Image.deleteOne({ _id: doc._id });

  if (doc.category === "logo" && doc.isPrimary) {
    await Setting.updateOne({ key: "brand.logoUrl" }, { $set: { value: null } }).catch(() => {});
  }

  ok(res, { deleted: true });
});