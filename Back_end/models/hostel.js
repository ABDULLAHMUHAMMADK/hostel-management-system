import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Hostel name is required"],
    trim: true,
  },
  location: {
    type: String,
    required: true,
  },
  totalRooms: {
    type: Number,
    required: true,
    default: 0,
  },
  totalCapacity: {
    type: Number,
    required: true,
    default: 0,
  },
  warden: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Hostel = mongoose.model("Hostel", hostelSchema);
