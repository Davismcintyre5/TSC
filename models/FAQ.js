import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    order: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

faqSchema.index({ category: 1, order: 1 });

export default mongoose.model("FAQ", faqSchema);