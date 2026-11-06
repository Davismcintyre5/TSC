import mongoose from "mongoose";

const notifyEmailSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    token: { type: String, required: true, index: true },
    confirmed: { type: Boolean, default: false },
    confirmedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("NotifyEmail", notifyEmailSchema);