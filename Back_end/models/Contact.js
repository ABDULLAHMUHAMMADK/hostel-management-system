import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "read", "replied", "archived"],
      default: "pending",
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    repliedAt: {
      type: Date,
    },
    replyMessage: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for faster queries
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });

export const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);