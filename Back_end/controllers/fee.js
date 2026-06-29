import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import { Fee } from "../models/fee.js";
import { User } from "../models/user.js";
import { Hostel } from "../models/hostel.js";
import mongoose from "mongoose";
import { Room } from "../models/room.js";
import AdminFee from "../models/AdminFee.js";

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
  const { amount, month } = req.body;
  
  try {
    // 🔍 Get warden's hostel from their profile
    const wardenId = req.user._id;
    
    // Find the hostel where this user is the warden
    const hostel = await Hostel.findOne({ warden: wardenId });
    
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "No hostel found associated with this warden account.",
      });
    }

    if (!hostel.students || hostel.students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found in this hostel to bill.",
      });
    }

    // 🔍 Get all students in this hostel with their room details
    const studentsWithRooms = await User.find({
      _id: { $in: hostel.students },
      role: "student"
    }).select("_id roomId hostelId");

    // 🆕 Filter out UNASSIGNED students (students without a room)
    const assignedStudents = studentsWithRooms.filter(
      student => student.roomId && student.roomId !== null
    );

    if (assignedStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No assigned students found in this hostel to bill. Please assign rooms to students first.",
      });
    }

    // 🔍 Find which assigned students already have fees for this month
    const existingFees = await Fee.find({ 
      hostelId: hostel._id, 
      month,
      studentId: { $in: assignedStudents.map(s => s._id) }
    });

    // 📋 Get student IDs that already have fees
    const existingStudentIds = existingFees.map(fee => fee.studentId.toString());
    
    // 🆕 Filter out students who already have fees for this month
    const newStudents = assignedStudents.filter(
      student => !existingStudentIds.includes(student._id.toString())
    );

    // ✅ If all assigned students already have fees
    if (newStudents.length === 0) {
      return res.status(200).json({
        success: true,
        message: `All ${assignedStudents.length} assigned students already have fees generated for ${month}.`,
        generated: 0,
        total: assignedStudents.length,
        alreadyHad: existingFees.length,
        unassignedCount: hostel.students.length - assignedStudents.length
      });
    }

    // 📝 Create fee records ONLY for new assigned students
    const feeRecords = newStudents.map((student) => ({
      studentId: student._id,
      hostelId: hostel._id,
      amount: amount,
      month: month,
      status: "pending",
    }));

    await Fee.insertMany(feeRecords);

    const unassignedCount = hostel.students.length - assignedStudents.length;

    res.status(201).json({
      success: true,
      message: `Bills generated for ${feeRecords.length} new student${feeRecords.length > 1 ? 's' : ''}! (${existingFees.length} students already had bills for ${month})`,
      generated: feeRecords.length,
      total: assignedStudents.length,
      alreadyHad: existingFees.length,
      unassignedCount: unassignedCount,
      hostelName: hostel.name || "Your Hostel",
      note: unassignedCount > 0 ? `${unassignedCount} unassigned student(s) were skipped.` : "All students are assigned."
    });

  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const getStudentFees = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Fixed from findOne to find so it returns a valid array of items
    const fees = await Fee.find({ studentId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: fees.length,
      data: fees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    // 💡 1. Get the logged-in student's ID directly from the auth middleware
    const student = req.user;

    // 💡 2. Get the clicked fee record ID from the request body
    const { feeId } = req.body || {};

    if (!feeId) {
      return res.status(400).json({
        success: false,
        message: "Missing feeId tracking parameter.",
      });
    }

    // 💡 3. Match using your EXACT database fields: _id and studentId
    const officialFeeRecord = await Fee.findOne({
      _id: feeId,
      studentId: student._id, // Changed from userId to studentId to match your DB schema!
    });

    // If this triggers, check if student._id type matches how studentId is saved
    if (!officialFeeRecord) {
      return res.status(404).json({
        success: false,
        message: "No matching fee record discovered for this profile.",
      });
    }

    // 🔒 Grab the official secure price from the found record
    const secureAmount = officialFeeRecord.amount;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: "http://localhost:5173/dashboard/fees/success",
      cancel_url: "http://localhost:5173/dashboard/fees/cancel",
      customer_email: student.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Hostel Housing Fee - ${officialFeeRecord.month || "Current Month"}`,
              description: `Automated invoice clearing for resident student: ${student.name}`,
            },
            unit_amount: Math.round(secureAmount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: student._id.toString(),
        feeId: feeId.toString(),
      },
    });

    return res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const stripeWebhook = async (req, res) => {
  const sign = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sign,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(`❌ Webhook Signature Verification Failed: ${error.message}`);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // 🔔 Handle completed checkout sessions
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    // Safely pull all possible keys out of metadata
    const { userId, wardenId, feeId, type } = session.metadata;

    console.log(`💳 Stripe Payment Captured. Processing Fee ID: ${feeId}`);

    try {
      // 1. Check if this is explicitly flagged as a corporate rent payment, OR try to update the Warden record
      if (type === "hostel_corporate_rent" || wardenId) {
        const wardenFeeUpdate = await AdminFee.findByIdAndUpdate(
          feeId,
          { $set: { status: "paid" } },
          { new: true }
        );

        if (wardenFeeUpdate) {
          console.log(`✅ Warden operational rent invoice ${feeId} marked paid successfully.`);
          return res.status(200).json({ received: true });
        }
      }

      // 2. Otherwise, update the Student housing invoice record
      const studentFeeUpdate = await Fee.findByIdAndUpdate(
        feeId, 
        { $set: { status: "paid" } },
        { new: true }
      );

      if (studentFeeUpdate) {
        console.log(`✅ Resident student housing invoice ${feeId} marked paid successfully.`);
      } else {
        // Fallback: If type was missing but it matched the Admin collection anyway
        const fallbackWardenUpdate = await AdminFee.findByIdAndUpdate(
          feeId,
          { $set: { status: "paid" } },
          { new: true }
        );

        if (fallbackWardenUpdate) {
          console.log(`✅ Warden invoice settled via fallback matching.`);
        } else {
          console.warn(`⚠️ Webhook matched no database records in either collection for Fee ID: ${feeId}`);
        }
      }

    } catch (dbError) {
      console.error(`❌ Database reconciliation pipeline error:`, dbError.message);
      return res.status(500).json({ success: false, error: dbError.message });
    }
  }

  // Always return a 200 response to Stripe immediately
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
      select: "name roomId",
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
