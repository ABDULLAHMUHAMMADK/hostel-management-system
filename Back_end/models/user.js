import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" }, // Added for immediate Warden contact/notifications
    role: {
      type: String,
      enum: ["admin", "warden", "student"],
      default: "student",
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      default: null,
      // required: true, // Fixed spelling typo here from "require" to "required"
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
    stripeCustomerId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("user", userSchema);