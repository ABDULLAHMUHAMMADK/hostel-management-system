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
      return res.status(404).json({ message: "Hostel not found", success: false });
    }

    // 1. Pull student from the Hostel document array ledger
    await Hostel.findByIdAndUpdate(hostel._id, {
      $pull: { students: studentId },
    });

    // 2. Erase hostel attachment context from student profile
    const user = await User.findByIdAndUpdate(studentId, { hostelId: null });

    // 3. Clear occupant space from room assignment
    if (user && user.roomId) {
      await Room.findByIdAndUpdate(user.roomId, {
        $pull: { occupants: studentId },
        $set: { status: "available" }, // Ensure room flag is marked clear
      });
    }

    // ─── ADVANCED STEP: REAL-TIME WEBSOCKET SYSTEM STREAM BROADCAST ───
    // Check if socket server instance is bound onto global app environment scope
    const io = req.app.get("socketio");
    if (io) {
      console.log("⚡ Emitting real-time eviction alerts over active streams...");
      // Trigger update hooks on both general analytics metrics and layout configuration cards
      io.emit("analytics_updated"); 
      io.emit("room_layout_changed", { studentId, roomId: user?.roomId });
    }

    return res.status(200).json({ 
      message: "Student removed from Hostel successfully", 
      success: true 
    });
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


export const transferStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { newRoomId } = req.body; // The target room (e.g., Room 3)
    const wardenId = req.user._id;

    // Verify the warden manages this hostel environment scope
    const hostel = await Hostel.findOne({ warden: wardenId });
    if (!hostel) {
      return res.status(404).json({ message: "Hostel authorization failed", success: false });
    }

    // 1. Fetch the target student to grab their current (old) room identity
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found", success: false });
    }

    const oldRoomId = student.roomId;

    // Optional Safety: Check if they are trying to transfer to the room they are already in
    if (oldRoomId?.toString() === newRoomId) {
      return res.status(400).json({ message: "Student is already allocated to this room", success: false });
    }

    // 2. Clear occupant space from the OLD room layout ledger
    if (oldRoomId) {
      await Room.findByIdAndUpdate(oldRoomId, {
        $pull: { occupants: studentId },
        $set: { status: "available" } // Set back to available as a vacancy opens up
      });
    }

    // 3. Register occupant footprint inside the NEW target room capacity array
    const targetRoom = await Room.findByIdAndUpdate(newRoomId, {
      $addToSet: { occupants: studentId }
    }, { new: true });

    if (!targetRoom) {
      return res.status(404).json({ message: "Target room configuration missing", success: false });
    }

    // 4. Update the room attachment context on the core student profile layout
    await User.findByIdAndUpdate(studentId, {
      roomId: newRoomId
    });

    // ─── REAL-TIME WEBSOCKET SYSTEM STREAM BROADCAST ───
    const io = req.app.get("socketio");
    if (io) {
      console.log("⚡ Broadcasting real-time room swap synchronization packages...");
      io.emit("analytics_updated"); 
      // Alert the UI grid to hot-reload both changing rooms simultaneously
      io.emit("room_layout_changed", { studentId, oldRoomId, newRoomId });
    }

    return res.status(200).json({ 
      message: `Student successfully relocated to room layout configuration`, 
      success: true 
    });

  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};



export const getHostelAnalytics = async (req, res) => {
  try {
    const wardenId = req.user._id || req.user.id || req.user;

    const hostel = await Hostel.findOne({ warden: wardenId });
    if (!hostel) {
      return res
        .status(404)
        .json({ message: "Hostel not found", success: false });
    }

    const hostelId = hostel._id;

    // Fetch all rooms tied to this hostel
    const rooms = await Room.find({ hostelId });

    let totalBeds = 0;
    let occupiedRoomsCount = 0;
    let completelyAvailableRoomsCount = 0;

    // ─── NEW EXACT REAL-TIME ROOM MATH CALCULATION ─────────────────────────
    rooms.forEach((room) => {
      // 1. Accumulate total physical bed counts across variable layouts
      totalBeds += room.maxCapicity || 0;

      // 2. Determine room usage based on actual active resident arrays
      if (room.occupants && room.occupants.length > 0) {
        // If even 1 student is in the room, it is counted as an occupied/used room
        occupiedRoomsCount++;
      } else {
        // If occupants array is empty, the room is completely available
        completelyAvailableRoomsCount++;
      }
    });
    // ───────────────────────────────────────────────────────────────────────

    const totalRooms = rooms.length;
    const currentStudentsCount = hostel.students ? hostel.students.length : 0;
    const availableBeds = totalBeds - currentStudentsCount;

    const occupancyRate =
      totalBeds > 0
        ? ((currentStudentsCount / totalBeds) * 100).toFixed(2)
        : "0.00";

    const paidFeesCount = await Fee.countDocuments({
      hostelId,
      status: "paid",
    });
    const pendingFeesCount = await Fee.countDocuments({
      hostelId,
      status: "pending",
    });

    return res.status(200).json({
      success: true,
      message: "Analytics fetched successfully",
      analytics: {
        hostelName: hostel.name,
        totalRooms: totalRooms,
        
        // ─── THE NEW CORRECT ROOM FIELDS ────────────────────────────────────
        occupiedRooms: occupiedRoomsCount,
        availableRooms: completelyAvailableRoomsCount,
        // ────────────────────────────────────────────────────────────────────
        
        totalBeds: totalBeds,
        occupiedBeds: currentStudentsCount,
        availableBeds: availableBeds,
        hostelOccupancy: `${occupancyRate}%`,
        status: availableBeds > 0 ? "Available" : "Full",
        financials: {
          totalPaidInvoices: paidFeesCount,
          totalPendingInvoices: pendingFeesCount,
        },
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
    })
      .sort({ roomNumber: 1 })
      .collation({ locale: "en", numericOrdering: true });
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

    // Fetch rooms sorted numerically
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

    // Process room data along with actual student assignments
    const availabilityData = await Promise.all(
      rooms.map(async (room) => {
        // CRITICAL UPGRADE: Find the actual student documents living in this specific room
        const occupants = await User.find({ roomId: room._id })
          .select("name email phone status"); // Grab useful client details

        const occupiedSeats = occupants.length;

        return {
          _id: room._id, // Send ID for frontend key lists
          roomNumber: room.roomNumber,
          roomType: room.type,
          capacity: room.maxCapicity, 
          occupiedSeats: occupiedSeats,
          availableSeats: room.maxCapicity - occupiedSeats,
          isFull: occupiedSeats >= room.maxCapicity ? "Full" : "Available",
          // CRITICAL UPGRADE: Return array of real profiles for frontend details/cards
          residents: occupants 
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
