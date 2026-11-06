import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    ticketIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "KES" },
    method: { type: String, enum: ["mpesa", "card", "bank"], required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "awaiting_confirmation"],
      default: "pending",
      index: true,
    },
    mpesa: {
      checkoutRequestId: { type: String, index: true, sparse: true },
      merchantRequestId: String,
      mpesaReceipt: String,
      phone: String,
    },
    paystack: {
      reference: { type: String, index: true, sparse: true },
      accessCode: String,
      phone: String,
      mpesaReceipt: String,
      paidAt: Date,
    },
    card: {
      providerRef: String,
      last4: String,
      brand: String,
    },
    bank: {
      reference: { type: String, index: true, sparse: true, unique: true },
      accountName: String,
      accountNumber: String,
      bankName: String,
      proofUrl: String,
      confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
      confirmedAt: Date,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ method: 1, status: 1 });

export default mongoose.model("Payment", paymentSchema);