// server/models/Image.js
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["hero", "stadium", "hospitality", "logo"],
      required: true,
      index: true,
    },
    label: { type: String, default: "" },        // e.g. "Skybox", "Platinum", "Front view"
    publicId: { type: String, required: true, unique: true }, // cloudinary public_id
    url: { type: String, required: true },       // secure_url
    width: Number,
    height: Number,
    format: String,                              // jpg/png/webp
    bytes: Number,
    alt: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },// for hero + logo only
    published: { type: Boolean, default: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

imageSchema.index({ category: 1, order: 1 });
imageSchema.index({ category: 1, isPrimary: 1 });

export default mongoose.model("Image", imageSchema);