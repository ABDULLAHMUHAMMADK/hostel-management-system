import { User } from "../models/user.js";
import { Hostel } from "../models/hostel.js";
import { Room } from "../models/room.js";

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createHostel = async (req, res) => {
  try {
    const { name, location, totalRooms } = req.body;

    const newHostel = await Hostel.create({
      name,
      location,
      totalRooms,
      warden: req.user._id,
    });

    await User.findByIdAndUpdate(req.user._id, {
      hostelId: newHostel._id,
    });

    const user = await User.findById(req.user._id);

    return res.status(201).json({
      message: "The hostel has been created",
      hostelName: newHostel.name,
      hostelWardan: user.name,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyHostel = async (req, res) => {
  try {
    const wardenId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const hostel = await Hostel.findOne({ warden: wardenId });
    if (!hostel) {
      return res
        .status(400)
        .json({ message: "You did not create a hostel yet", success: false });
    }

    const totalStudents = hostel.students.length;
    const totalPages = Math.ceil(totalStudents / limit);

    const getStudents = await hostel.populate([
      {
        path: "students",
        options: { limit: limit, skip: skip },
        select: "name email",
      },
      {
        path: "warden",
        select: "name email",
      },
    ]);
    if (totalStudents === 0 || page > totalPages) {
      return res.status(400).json({ message: "no page found", success: false });
    }
    return res.status(200).json({
      message: `heres the detail and the total students is ${hostel.students.length}`,
      totalPages: totalPages,

      currentPage: page,
      data: getStudents,
      success: true,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

export const removeStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const wardenId = req.user._id;

    const hostel = await Hostel.findOne({ warden: wardenId });

    if (!hostel) {
      return res
        .status(404)
        .json({ message: "hostel not found", success: false });
    }

    await Hostel.findByIdAndUpdate(hostel._id, {
      $pull: { students: studentId },
    });
    await User.findByIdAndUpdate(studentId, { hostelId: null });

    return res
      .status(200)
      .json({ message: "student removed from Hostel", success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

export const updateHostel = async (req, res) => {
  try {
    const wardenId = req.user._id;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return res
        .status(404)
        .json({ message: "Please fill at least one field", success: false });
    }

    const updateHostel = await Hostel.findOneAndUpdate(
      { warden: wardenId },
      updateData,
      { new: true },
    );

    // console.log(updateHostel);

    if (!updateHostel) {
      return res
        .status(404)
        .json({ message: "Hostel not found for this user", success: false });
    }

    return res.status(200).json({
      message: "hostel detail update successfully",
      updateHostel,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const searchStudent = async (req, res) => {
  try {
    const { name } = req.query;
    const wardenId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    if (!name) {
      return res
        .status(400)
        .json({ message: "Search term is required", success: false });
    }

    const hostel = await Hostel.findOne({ warden: wardenId }).populate({
      path: "students",
      match: {
        name: { $regex: name, $options: "i" },
      },
      options: {
        limit: limit,
        skip: skip,
      },
      select: "name email",
    });

    if (!hostel) {
      return res
        .status(404)
        .json({ message: "Hotel not found", success: false });
    }

    return res.status(200).json({
      message: `${hostel.students.length} students found`,
      data: hostel.students,
      currentPage: page,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const getHostelAnalytics = async (req, res) => {
  try {
    const wardenId = req.user;

    const hostel = await Hostel.findOne({ warden: wardenId });

    if (!hostel) {
      return res
        .status(404)
        .json({ message: "Hostel not found", success: false });
    }

    const totalBeds = hostel.totalCapacity;
    const totalRooms = hostel.totalRooms;
    const currentStudent = hostel.students.length;

    const availableBeds = totalBeds - currentStudent;
    const occupancyRate = ((currentStudent / totalBeds) * 100).toFixed(2);
    return res.status(200).json({
      message: "Analytics fetched successfully",
      Analytics: {
        hostelname: hostel.name,
        totalRooms: totalRooms,
        totaBeds: totalBeds,
        occupiedBeds: currentStudent,
        availableBeds: availableBeds,
        hostelOccupancy: `${occupancyRate}%`,
        status: availableBeds > 0 ? "Available" : "Full",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    const student = req.user;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      success_url: "http://127.0.0.1:5500/succes.html",
      cancel_url: "http://127.0.0.1:5500/reject.html",

      customer_email: student.email,

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Hostel Monthely Fee",
              description: `payment for student ${student.name}`,
            },
            unit_amount: 200 * 100,
          },
          quantity: 1,
        },
      ],

      metadata: { userId: student._id.toString() },
    });

    return res.status(200).json({
      message: "Checkout session created! Redirecting to payment...",
      success: true,
      url: session.url,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const stripeWebhook = async (req, res) => {
  console.log("stripewebhook is running");
  const sign = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sign,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    console.log(event.type);
  } catch (error) {
    return res.status(400).json({ error: error.message, success: false });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const studentId = session.metadata.userId;
    console.log("Updating database for student:", studentId);

    await User.findByIdAndUpdate(studentId, {
      paymentStatus: "paid",
      lastPaymentDate: new Date(),
    });
  }
  res.status(200).json({ message: "payment successfully", recevied: true });
};

export const initializeRooms = async (req, res) => {
  const hostelId = req.user.hostelId;

  const { roomBatches } = req.body;

   

  const capacityMap = {
    "single": 1000,
    "2-seater": 2,
    "3-seater": 3,
    "4-seater": 4,
    "5-seater": 5,
  };
  const roomsToCreate = [];

  roomBatches.forEach((batch) => {

    for (let i = batch.start; i <= batch.end; i++) {
      roomsToCreate.push({
        roomNumber: i.toString(),
        type: batch.type,
        maxCapicity: capacityMap[batch.type],
        hostelId: hostelId,
      });
    }
  });

  try {
    const createdRooms = await Room.insertMany(roomsToCreate);
    res.status(201).json({
      success: true,
      message: `${createdRooms.length} rooms created!`,
      data: createdRooms,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
