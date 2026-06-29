import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["single", "double", "triple", "4-seater", "5-seater", "2-seater", "3-seater"],
      required: true,
    },
    maxCapicity: {
      type: Number,
      required: true,
    },
    occupants: [
      {
        type: mongoose.Schema.Types.ObjectId,
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

export const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);