import mongoose from "mongoose";

const adminFeeSchema = new mongoose.Schema(
  {
    wardenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: String, // e.g., "July 2026"
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const AdminFee = mongoose.model("AdminFee", adminFeeSchema);
export default AdminFee;