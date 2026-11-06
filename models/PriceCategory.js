import mongoose from "mongoose";

const priceCategorySchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["L1", "L2", "L3", "gold", "platinum", "skybox", "accessible"],
      required: true,
      index: true,
    },
    phase: { type: Number, default: 1, index: true },
    name: { type: String, required: true },
    section: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "KES" },
    tier: { type: String, enum: ["regular", "mid", "premium"], required: true },
    order: { type: Number, default: 0 },
    capacity: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

priceCategorySchema.index({ level: 1, phase: 1, order: 1 });
priceCategorySchema.index({ level: 1, phase: 1, name: 1 }, { unique: true });

export default mongoose.model("PriceCategory", priceCategorySchema);