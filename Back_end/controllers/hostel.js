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
        .json({ message: "Hostel not found", success: false });
    }

    // 1. DO NOT touch hostel.students array or user.hostelId!
    // Simply clear the room assignment from the core student profile.
    const updatedUser = await User.findByIdAndUpdate(
      studentId,
      { roomId: null },
      { new: true },
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "Student profile not found", success: false });
    }

    // 2. Find which room currently contains this student in its occupants list
    const targetedRoom = await Room.findOne({ occupants: studentId });

    if (targetedRoom) {
      // Pull student from the room array and get fresh count
      const updatedRoom = await Room.findByIdAndUpdate(
        targetedRoom._id,
        { $pull: { occupants: studentId } },
        { new: true },
      );

      // 3. Status flag recalculation handled entirely on backend
      const isNowAvailable =
        updatedRoom.occupants.length < updatedRoom.maxCapicity;
      await Room.findByIdAndUpdate(targetedRoom._id, {
        $set: { status: isNowAvailable ? "available" : "full" },
      });
    }

    // ─── WEBSOCKET BROADCAST ───────────────────────────────────────────
    const io = req.app.get("socketio") || global.io;
    if (io) {
      console.log(
        "⚡ Emitting highly accurate real-time room eviction sync...",
      );
      io.emit("analytics_updated");
      io.emit("room_layout_changed", {
        studentId,
        roomId: targetedRoom ? targetedRoom._id : null,
      });
    }

    return res.status(200).json({
      message:
        "Student unassigned from room layout successfully, remaining in hostel registry",
      success: true,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

export const searchStudent = async (req, res) => {
  try {
    // 1. Accept name and status filters from the request queries
    const { name, statusType } = req.query; // statusType can be: "All", "Allocated", "Unassigned"
    const wardenId = req.user._id;

    // 2. Locate the Warden's Hostel context
    const hostel = await Hostel.findOne({ warden: wardenId });
    if (!hostel) {
      return res.status(404).json({
        message: "Hostel authorization failed for this warden",
        success: false,
      });
    }

    // 3. Establish base conditions targeting all accounts with the 'student' role
    const queryConditions = {
      role: "student",
    };

    // 4. Handle Live Typing Search Input Filter
    if (name && name.trim() !== "") {
      queryConditions.name = { $regex: name.trim(), $options: "i" };
    }

    // 5. Handle Professional Allocation Status Filtering
    if (statusType === "Allocated") {
      // Must have an active assigned Room ID link ($ne stands for Not Equal)
      queryConditions.roomId = { $ne: null };
    } else if (statusType === "Unassigned") {
      // Room ID link is explicitly unallocated/null
      queryConditions.roomId = null;
    }

    // 6. Execute direct find array with NO skips or limits
    const students = await User.find(queryConditions)
      .select("name email phone roomId stripeCustomerId hostelId createdAt")
      .populate({
        path: "roomId",
        select: "roomNumber roomType maxCapicity status",
      })
      .sort({ name: 1 }); // Keeps the entire list alphabetized neatly A-Z

    // 7. High-Fidelity Structural JSON Response Payload
    return res.status(200).json({
      success: true,
      message: `Successfully loaded ${students.length} student records`,
      data: students,
      totalCount: students.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
export const transferStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { newRoomId } = req.body;
    const wardenId = req.user._id;

    const hostel = await Hostel.findOne({ warden: wardenId });
    if (!hostel) {
      return res
        .status(404)
        .json({ message: "Hostel authorization failed", success: false });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ message: "Student profile not found", success: false });
    }

    const oldRoomId = student.roomId;
    if (oldRoomId?.toString() === newRoomId) {
      return res.status(400).json({
        message: "Student is already allocated to this room",
        success: false,
      });
    }

    // Verify target room capacity availability on backend before moving
    const targetRoomCheck = await Room.findById(newRoomId);
    if (!targetRoomCheck) {
      return res
        .status(404)
        .json({ message: "Target room layout does not exist", success: false });
    }

    const currentOccupantsCount = await User.countDocuments({
      roomId: newRoomId,
    });
    if (currentOccupantsCount >= targetRoomCheck.maxCapicity) {
      return res.status(400).json({
        message: "Transfer rejected: Target room is full!",
        success: false,
      });
    }

    // 1. Clear occupant space from OLD room
    if (oldRoomId) {
      const updatedOldRoom = await Room.findByIdAndUpdate(
        oldRoomId,
        {
          $pull: { occupants: studentId },
        },
        { new: true },
      );

      if (updatedOldRoom) {
        await Room.findByIdAndUpdate(oldRoomId, {
          $set: {
            status:
              updatedOldRoom.occupants.length < updatedOldRoom.maxCapicity
                ? "available"
                : "full",
          },
        });
      }
    }

    // 2. Add to NEW room array
    const updatedNewRoom = await Room.findByIdAndUpdate(
      newRoomId,
      {
        $addToSet: { occupants: studentId },
      },
      { new: true },
    );

    // Update target room status directly on backend
    await Room.findByIdAndUpdate(newRoomId, {
      $set: {
        status:
          currentOccupantsCount + 1 >= updatedNewRoom.maxCapicity
            ? "full"
            : "available",
      },
    });

    // 3. Update core user profile reference link
    await User.findByIdAndUpdate(studentId, { roomId: newRoomId });

    // ─── WEBSOCKET STREAM BROADCAST ────────────────────────────────────
    const io = req.app.get("socketio") || global.io;
    if (io) {
      console.log(
        "⚡ Broadcasting real-time room swap synchronization packages...",
      );
      io.emit("analytics_updated");
      io.emit("room_layout_changed", { studentId, oldRoomId, newRoomId });
    }

    return res.status(200).json({
      message:
        "Student successfully relocated to new room layout configuration",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const getHostelAnalytics = async (req, res) => {
  try {
    const wardenId = req.user._id || req.user.id || req.user;

    // 1. Fetch the hostel managed by this warden
    const hostel = await Hostel.findOne({ warden: wardenId });
    if (!hostel) {
      return res
        .status(404)
        .json({ message: "Hostel not found for this warden", success: false });
    }

    console.log(hostel);

    const hostelId = hostel._id;

    // 2. Fetch all rooms and all registered students concurrently
    const [rooms, totalRegisteredStudents] = await Promise.all([
      Room.find({ hostelId }),
      User.find({ role: "student" }).select("roomId"),
    ]);

    let totalBeds = 0;
    let totalOccupiedBeds = 0;

    // ─── YOUR LOGIC COUNTERS ───────────────────────────────────────────
    let usedRoomsCount = 0; // At least 1 student inside
    let fullyOccupiedRoomsCount = 0; // Room capacity is 100% packed
    let completelyEmptyRoomsCount = 0; // 0 students inside
    // ───────────────────────────────────────────────────────────────────

    // 3. Compute Real-Time Room States
    rooms.forEach((room) => {
      const maxCap = room.maxCapicity || room.capacity || 0;
      const occupantsCount = room.occupants ? room.occupants.length : 0;

      totalBeds += maxCap;
      totalOccupiedBeds += occupantsCount;

      // Exact Real-Time Structural Room Calculations
      if (occupantsCount > 0) {
        usedRoomsCount++; // It has students, so it's a "Used Room"

        if (occupantsCount >= maxCap) {
          fullyOccupiedRoomsCount++; // It's packed to the max limit!
        }
      } else {
        completelyEmptyRoomsCount++; // Nobody is inside
      }
    });

    // 4. Calculate Unassigned Students Dynamically
    const hostelRoomIdsStrings = rooms.map((r) => r._id.toString());
    const unassignedStudentsCount = totalRegisteredStudents.filter(
      (student) => {
        if (!student.roomId) return true;
        return !hostelRoomIdsStrings.includes(student.roomId.toString());
      },
    ).length;

    // 5. Finalize Dashboard Metrics
    const totalRooms = rooms.length;
    const availableBeds = totalBeds - totalOccupiedBeds;

    const occupancyRate =
      totalBeds > 0 ? ((totalOccupiedBeds / totalBeds) * 100).toFixed(0) : "0";

    // 6. Fetch Financial State Identifiers
    const paidFeesCount = await Fee.countDocuments({
      hostelId,
      status: "paid",
    });
    const pendingFeesCount = await Fee.countDocuments({
      hostelId,
      status: "pending",
    });

    // 7. Uniform Payload Delivery Matrix
    return res.status(200).json({
      success: true,
      message: "Hostel analytical indices synchronized successfully.",
      analytics: {
        hostelName: hostel.name,
        totalRooms: totalRooms,

        // ─── NEW ACCURATE ROOM METRICS ─────────────────────────────────
        usedRooms: usedRoomsCount, // e.g., returns 3
        fullyOccupiedRooms: fullyOccupiedRoomsCount, // e.g., returns 2
        availableRooms: completelyEmptyRoomsCount, // Empty rooms left
        // ───────────────────────────────────────────────────────────────

        totalBeds: totalBeds,
        occupiedBeds: totalOccupiedBeds,
        availableBeds: availableBeds,
        unassignedStudents: unassignedStudentsCount,

        hostelOccupancy: `${occupancyRate}%`,
        status: availableBeds > 0 ? "Available" : "Full",
        financials: {
          totalPaidInvoices: paidFeesCount,
          totalPendingInvoices: pendingFeesCount,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
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
          ? `Room ${roomNumber} not found.`
          : "No rooms registered.",
      });
    }

    // Process everything on the backend to avoid frontend logic calculations
    const availabilityData = await Promise.all(
      rooms.map(async (room) => {
        // Find existing users who have this room assigned
        const occupants = await User.find({
          roomId: room._id,
          role: "student",
        }).select("name email phone status");

        const occupiedSeats = occupants.length;
        const availableSeats = Math.max(0, room.maxCapicity - occupiedSeats);

        // CLEANUP BACKEND SYNC GUARD:
        // If the database occupants array length doesn't match real active occupants, resync it
        if (room.occupants.length !== occupiedSeats) {
          await Room.findByIdAndUpdate(room._id, {
            $set: { occupants: occupants.map((u) => u._id) },
          });
        }

        return {
          _id: room._id,
          roomNumber: room.roomNumber,
          roomType: room.type || "Standard",
          capacity: room.maxCapicity,
          occupiedSeats: occupiedSeats,
          availableSeats: availableSeats,
          status:
            occupiedSeats >= room.maxMaxCapicity || availableSeats === 0
              ? "Full"
              : "Available",
          residents: occupants, // Verified list of real active profiles
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

export const updateHostel = async (req, res) => {
  try {
    const { name, location } = req.body;

    // 1. Validation: Check if at least one field is provided
    if (!name && !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide a hostel name or location to update.",
      });
    }

    // 2. Prepare update payload dynamically
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (location) updateData.location = location.trim();

    // 3. Find the hostel where the 'warden' field matches the logged-in user's ID
    const updatedHostel = await Hostel.findOneAndUpdate(
      { warden: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }, // returns the updated document and checks schema constraints
    );

    // 4. If no hostel matches this warden
    if (!updatedHostel) {
      return res.status(404).json({
        success: false,
        message: "No assigned hostel facility found for your warden account.",
      });
    }

    // 5. Send back successful response
    return res.status(200).json({
      success: true,
      message: "Hostel facility configuration updated successfully.",
      data: updatedHostel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while updating the hostel.",
    });
  }
};

export const getHostelProfile = async (req, res) => {
  try {
    // 1. Find the logged-in user by ID (supplied by verifyUser middleware)
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Warden identity record not found.",
      });
    }

    // 2. Find the hostel explicitly linked to this warden to guarantee full population of name & location
    const assignedHostel = await Hostel.findOne({ warden: user._id }).select(
      "name location totalRooms students",
    );
    // console.log(assignedHostel)
    // 3. Format the data package neatly for your frontend state mapping
    const profilePayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      // Pass the full hostel sub-object so both 'name' and 'location' load into the React inputs
      hostelId: assignedHostel
        ? {
            _id: assignedHostel._id,
            name: assignedHostel.name,
            location: assignedHostel.location,
            totalRooms: assignedHostel.totalRooms,
            studentCount: assignedHostel.students?.length || 0,
          }
        : null,
    };

    return res.status(200).json({
      success: true,
      data: profilePayload,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while fetching profile configurations.",
    });
  }
};

export const getStudentResidentialProfile = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Locate the room asset where this student's ID resides inside the occupants array
    const roomAllocation = await Room.findOne({ occupants: studentId })
      .populate({
        path: "hostelId",
        select: "name type", // Removed block from the query select block
      })
      .populate({
        path: "occupants",
        select: "name email",
      });

    if (!roomAllocation) {
      return res.status(200).json({
        success: true,
        assigned: false,
        message: "Student profile is active but awaiting room asset mapping.",
        roomNumber: "Not Assigned",
        hostelName: "Unassigned Hub",
        roommates: [],
        isSpaceAvailable: false,
        slotsLeft: 0,
      });
    }

    // Filter out the requesting student's own profile info from the companion list
    const roommateNames = roomAllocation.occupants
      .filter((occupant) => occupant._id.toString() !== studentId.toString())
      .map((occupant) => occupant.name);

    // Calculate live dynamic vacancy metrics using your schema keys
    const currentOccupantCount = roomAllocation.occupants.length;
    const maxCapacity = roomAllocation.maxCapicity || 0; // matching your spelling key variation
    const slotsLeft = Math.max(0, maxCapacity - currentOccupantCount);
    const isSpaceAvailable = slotsLeft > 0;

    // Return payload with block completely removed, substituted with room occupancy statuses
    return res.status(200).json({
      success: true,
      assigned: true,
      roomNumber: roomAllocation.roomNumber,
      roomType: roomAllocation.roomType,
      hostelName: roomAllocation.hostelId?.name || "Campus Living Node",
      roommates: roommateNames,
      isSpaceAvailable: isSpaceAvailable,
      slotsLeft: slotsLeft,
    });
  } catch (error) {
    console.error("Residential parameter sync breakdown:", error.message);
    return res.status(500).json({
      success: false,
      message:
        "An internal server error occurred reading room parameters: " +
        error.message,
    });
  }
};
