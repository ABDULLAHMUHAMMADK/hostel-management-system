import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A notice title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Notice description content is required"],
    },
    category: {
      type: String,
      enum: ["general", "maintenance", "mess", "emergency"],
      default: "general",
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: [true, "A notice must target a specific hostel facility"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Notice = mongoose.models.Notice || mongoose.model("Notice", noticeSchema);