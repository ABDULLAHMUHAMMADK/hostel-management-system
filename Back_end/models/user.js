import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "warden", "student"],
      default: "student",
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      require: true,
    },

    stripeCustomerId: {
      type: String,
    },
    monthlyFee: { type: Number, default: 2000 },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    lastPaymentDate: { type: Date },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("user", userSchema);
