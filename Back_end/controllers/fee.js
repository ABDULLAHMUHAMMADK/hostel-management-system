import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import { Fee } from "../models/fee.js";
import { User } from "../models/user.js";
import { Hostel } from "../models/hostel.js";
import mongoose from "mongoose";
import { Room } from "../models/room.js";

export const createFee = async (req, res) => {
  const { studentId, hostelId, amount, month } = req.body;

  try {
    const newFee = new Fee({
      studentId,
      hostelId,
      amount,
      month,
      status: "pending",
    });

    const savedFee = await newFee.save();

    res.status(201).json({
      success: true,
      message: `Fee generated for ${month}`,
      data: savedFee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateMonthlyFees = async (req, res) => {
  const { hostelId, amount, month } = req.body;

  try {
    const hostel = await Hostel.findById(hostelId).populate("students");

    if (hostel.students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found in this hostel to bill.",
      });
    }

    const existingFee = await Fee.findOne({ hostelId, month });
    if (existingFee) {
      return res.status(400).json({
        success: false,
        message: `Fees for ${month} have already been generated for this hostel.`,
      });
    }

    const feeRecords = hostel.students.map((student) => {
      return {
        studentId: student._id,
        hostelId: hostelId,
        amount: amount,
        month: month,
        status: "pending",
      };
    });

    await Fee.insertMany(feeRecords);
    res.status(201).json({
      success: true,
      message: `Bills generated for ${hostel.students.length} students!`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const getStudentFees = async (req, res) => {
  const studentId = req.user._id;

  try {
    const fees = await Fee.findOne({ studentId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: fees.length,
      data: fees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    const student = req.user;
    const { feeId, amount } = req.body;

    const feeExists = await Fee.findById(feeId);
    if (!feeExists) {
      return res
        .status(404)
        .json({ success: false, message: "Fee record not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: "http://127.0.0.1:5500/success.html",
      cancel_url: "http://127.0.0.1:5500/reject.html",

      customer_email: student.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Hostel Fee - ${feeExists.month}`,
              description: `Payment for student ${student.name}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: student._id.toString(),
        feeId: feeId.toString(),
      },
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const stripeWebhook = async (req, res) => {
  const sign = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sign,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, feeId } = session.metadata;

    await Fee.findByIdAndUpdate(feeId, { $set: { status: "paid" } });

  }

  res.status(200).json({ received: true });
};

export const getFeeStats = async (req, res) => {
  try {
    const { hostelId } = req.user;
    const stats = await Fee.aggregate([
      {
        $match: {
          hostelId: new mongoose.Types.ObjectId(hostelId),
        },
      },
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDefaulters = async (req, res) => {
  try {
    const { hostelId } = req.user;

    const defaulters = await Fee.find({
      hostelId: hostelId,
      status: "pending",
    }).populate({
      path: "studentId",
      select: "name email roomId",
      populate: {
        path: "roomId",
        select: "roomNumber type",
      },
    });
    res.status(200).json({
      success: true,
      message: `${defaulters.length} students have not paid `,
      data: defaulters,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
