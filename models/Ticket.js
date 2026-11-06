import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    section: { type: String, required: true },
    row: { type: String, required: true },
    number: { type: String, required: true },
  },
  { _id: false }
);

const buyerSchema = new mongoose.Schema(
  {
    identifier: { type: String, default: "", index: true },
    channel: { type: String, enum: ["sms", "email"], default: "email" },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "PriceCategory", required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    serial: { type: String, unique: true, index: true },
    buyer: { type: buyerSchema, default: () => ({}) },
    seat: { type: seatSchema, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: "KES" },
    qrCode: { type: String, default: "" },
    gate: { type: String, default: "A" },
    status: {
      type: String,
      enum: ["held", "paid", "used", "void"],
      default: "held",
      index: true,
    },
    holdExpiresAt: Date,
    paidAt: Date,
    usedAt: Date,
  },
  { timestamps: true }
);

ticketSchema.index({ "seat.section": 1, "seat.row": 1, "seat.number": 1 });
ticketSchema.index({ "buyer.identifier": 1, status: 1 });

export default mongoose.model("Ticket", ticketSchema);