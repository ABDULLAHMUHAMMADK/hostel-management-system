import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["single", "2-seater", "3-seater", "4-seater", "5-seater"],
      required: true,
    },
    maxCapicity: {
      type: Number,
      required: true,
    },
    hostelId: {
      type: mongoose.Schema.ObjectId,
      ref: "Hostel",
      required: true,
    },
    occupants: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

roomSchema.index({ roomNumber: 1, hostelId: 1 }, { unique: true });

export const Room = mongoose.model("Room",roomSchema)
