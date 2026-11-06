import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema(
  { title: { type: String, required: true }, body: { type: String, required: true } },
  { _id: false }
);

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    lat: Number,
    lng: Number,
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "main", unique: true },
    slug: { type: String, required: true },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    kickoff: { type: Date, required: true },
    gatesOpen: { type: Date, required: true },
    saleOpensAt: { type: Date, required: true },
    venue: { type: venueSchema, required: true },
    seatType: { type: String, default: "Numbered" },
    deliveryChannels: { type: [String], default: ["SMS", "email"] },
    included: { type: [String], default: [] },
    rules: { type: [ruleSchema], default: [] },
    status: {
      type: String,
      enum: ["scheduled", "sale_open", "sold_out", "closed"],
      default: "scheduled",
    },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Match", matchSchema);