import { User } from "../models/user.js";
import { Hostel } from "../models/hostel.js";
import { Room } from "../models/room.js";
import { Fee } from "../models/fee.js";

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
    if (totalStudents === 0) {
      return res
        .status(400)
        .json({ message: "no student found", success: false });
    }
    if (page > totalPages) {
      return res.status(400).json({ message: "no page found", success: false });
    }
    return res.status(200).json({
      message: `heres the detail and the total students is ${hostel.students.length}`,
      totalPages: totalPages,

      currentPage: page,
      // warden: getStudents.warden,
      // students: getStudents.students,
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

    const user = await User.findByIdAndUpdate(studentId, { hostelId: null });

    console.log(user);

    await Room.findByIdAndUpdate(user.roomId, {
      $pull: { occupants: studentId },
      $set: { status: "available" },
    });

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



export const initializeRooms = async (req, res) => {
  try {
    const hostelId = req.user.hostelId;
    const { roomBatches } = req.body;

    const capacityMap = {
      single: 1,
      "2-seater": 2,
      "3-seater": 3,
      "4-seater": 4,
      "5-seater": 5,
    };

    const hostel = await Hostel.findById(hostelId);

    if (!hostel) {
      return res.status(404).json({
        message: "Hostel not found",
        success: false,
      });
    }

    const maxRooms = hostel.totalRooms;

    let totalRequestedRooms = 0;

    roomBatches.forEach((batch) => {
      if (batch.start > batch.end) {
        throw new Error(
          `Invalid range: start (${batch.start}) cannot be greater than end (${batch.end})`,
        );
      }

      if (batch.start < 1) {
        throw new Error("Room number cannot be less than 1");
      }

      if (batch.end > maxRooms) {
        throw new Error(`Room number cannot exceed hostel limit (${maxRooms})`);
      }

      totalRequestedRooms += batch.end - batch.start + 1;
    });

    if (totalRequestedRooms > maxRooms) {
      return res.status(400).json({
        message: `Room limit exceeded. Max allowed: ${maxRooms}, Requested: ${totalRequestedRooms}`,
        success: false,
      });
    }

    const roomSet = new Set();
    const roomsToCreate = [];

    roomBatches.forEach((batch) => {
      for (let i = batch.start; i <= batch.end; i++) {
        const roomNumber = i.toString();

        if (roomSet.has(roomNumber)) {
          return res.status(400).json({
            message: `Duplicate room number in request: ${roomNumber}`,
            success: false,
          });
        }

        roomSet.add(roomNumber);

        roomsToCreate.push({
          roomNumber,
          type: batch.type,
          maxCapicity: capacityMap[batch.type],
          hostelId,
        });
      }
    });

    const existingRooms = await Room.find({
      hostelId,
      roomNumber: { $in: roomsToCreate.map((r) => r.roomNumber) },
    });

    if (existingRooms.length > 0) {
      return res.status(400).json({
        message: "Some rooms already exist for this hostel",
        existingRooms: existingRooms.map((r) => r.roomNumber),
        success: false,
      });
    }

    const createdRooms = await Room.insertMany(roomsToCreate);

    return res.status(201).json({
      success: true,
      message: `${createdRooms.length} rooms created successfully`,
      data: createdRooms,
    });
  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};




export const getRoomAvailability = async (req, res) => {
  try {
    const { hostelId } = req.user;
    const { roomNumber } = req.query;

    let query = { hostelId };

    if (roomNumber) {
      query.roomNumber = roomNumber;
    }
    console.log(query);
    const rooms = await Room.find(query)
      .sort({ roomNumber: 1 })
      .collation({ locale: "en", numericOrdering: true });

    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: roomNumber
          ? `Room ${roomNumber} not found in this hostel.`
          : "No rooms found in this hostel.",
      });
    }

    const availabilityData = await Promise.all(
      rooms.map(async (room) => {
        const studentCount = await User.countDocuments({ roomId: room._id });

        return {
          roomNumber: room.roomNumber,
          roomType: room.type,
          capacity: room.maxCapicity, // Fixed spelling from 'capicity'
          occupiedSeats: studentCount,
          availableSeats: room.maxCapicity - studentCount,
          isFull: studentCount >= room.maxCapicity ? "Full" : "Available",
        };
      }),
    );

    res.status(200).json({
      success: true,
      totalRooms: rooms.length,
      data: availabilityData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
