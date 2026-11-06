import mongoose from "mongoose";

const priceCategorySchema = new mongoose.Schema(
  {
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

priceCategorySchema.index({ order: 1 });

export default mongoose.model("PriceCategory", priceCategorySchema);