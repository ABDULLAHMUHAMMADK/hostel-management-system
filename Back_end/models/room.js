import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["single", "double", "triple"],
      required: true,
    },
    maxCapicity: {
      type: Number,
      required: true,
    },
    occupants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        // Ensure this string matches EXACTLY with the name used when creating the User model
        ref: "user", 
      },
    ],
    status: {
      type: String,
      enum: ["available", "full"],
      default: "available",
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
  },
  { timestamps: true }
);

// This safe check checks if the Room model is already compiled before creating a new one
export const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);