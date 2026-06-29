import { User } from "../models/user.js";
import { Hostel } from "../models/hostel.js";
import { generateToken } from "../utils/Token.js";
import { Room } from "../models/room.js";
import bcrypt from "bcryptjs";



// Fetch ALL hostels unconditionally
export const getSearchableHostels = async (req, res) => {
  try {
    // Completely bypass query parameters and grab everything
    const hostels = await Hostel.find({}).select("name _id");
    
    return res.status(200).json({ success: true, hostels });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAvailableRoomsByHostel = async (req, res) => {
  try {
    const { hostelId } = req.params;
    
    // 1. Find rooms belonging to this hostel where status is NOT full
    // FIX: Changed maxCapacity to maxCapicity to match your exact schema spelling
    const rooms = await Room.find({ 
      hostelId, 
      status: { $ne: "full" } 
    }).select("roomNumber maxCapicity occupants _id");

    // 2. Filter array where active occupants length is strictly below max capacity allowance
    const availableRooms = rooms.filter(room => {
      const maxBeds = room.maxCapicity || 0;
      const currentOccupants = room.occupants ? room.occupants.length : 0;
      return currentOccupants < maxBeds;
    });

    // Returns the filtered list (could be empty [] if none are free, or if no rooms exist yet)
    return res.status(200).json({ success: true, rooms: availableRooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const userRegister = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // 1. Core structural validations for EVERYONE
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill name, email, password, and phone fields properly",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User Already Exists",
      });
    }

    const targetRole = role || "student";
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // 2. Handle Student Setup explicitly
    if (targetRole === "student") {
      const { hostelId, roomId } = req.body;

      if (!hostelId || hostelId.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Students must select a valid hostel to register",
        });
      }
      if (!roomId || roomId.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Students must select a valid room to register",
        });
      }

      const linkedHostel = await Hostel.findById(hostelId);
      if (!linkedHostel) {
        return res.status(404).json({ success: false, message: "Hostel not found" });
      }

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ success: false, message: "Room not found." });
      }

      const maxCap = room.maxCapacity || room.maxCapicity;
      if (room.occupants.length >= maxCap) {
        return res.status(400).json({ success: false, message: "Room is already full!" });
      }

      const isNowFull = room.occupants.length + 1 >= maxCap;

      const newStudent = await User.create({
        name,
        email,
        password: hashPassword,
        phone,
        role: "student",
        hostelId,
        roomId
      });

      linkedHostel.students.push(newStudent._id);
      await linkedHostel.save();

      await Room.findByIdAndUpdate(roomId, {
        $push: { occupants: newStudent._id },
        $set: { status: isNowFull ? "full" : "available" },
      });

      if (global.io) {
        try {
          const totalRooms = await Room.countDocuments({ hostelId });
          const roomsArray = await Room.find({ hostelId });
          const totalBeds = roomsArray.reduce((acc, curr) => acc + (curr.maxCapacity || curr.maxCapicity || 0), 0);
          const occupiedBeds = await User.countDocuments({ hostelId, role: "student" });
          const availableBeds = Math.max(0, totalBeds - occupiedBeds);
          const occupancyPercentage = totalBeds > 0 ? `${((occupiedBeds / totalBeds) * 100).toFixed(2)}%` : "0%";

          global.io.emit("analytics_updated", {
            totalRooms,
            totalBeds,
            occupiedBeds,
            availableBeds,
            hostelOccupancy: occupancyPercentage,
            hostelName: linkedHostel.name || "System Campus",
            status: occupancyPercentage === "100.00%" ? "Full" : "Active"
          });
        } catch (err) {
          console.log("Socket logging failure:", err.message);
        }
      }

      return res.status(201).json({
        success: true,
        message: "Student registered successfully",
        data: newStudent,
      });
    }

    // 3. Handle Warden Setup explicitly with combined Hostel profile attachment
    if (targetRole === "warden") {
      const { hostelName, hostelLocation, totalRooms } = req.body;

      if (!hostelName || !hostelLocation || !totalRooms) {
        return res.status(400).json({
          success: false,
          message: "Wardens must provide hostel name, location, and total room limits",
        });
      }

      // Create Warden user framework entity first
      const newWarden = await User.create({
        name,
        email,
        password: hashPassword,
        phone,
        role: "warden"
      });

      // Directly assemble the linked Hostel data record profile
      const newHostel = await Hostel.create({
        name: hostelName,
        location: hostelLocation,
        totalRooms: Number(totalRooms),
        warden: newWarden._id
      });

      // Map references crosswise 
      newWarden.hostelId = newHostel._id;
      await newWarden.save();

      return res.status(201).json({
        success: true,
        message: "Warden account and corresponding campus profile configured successfully!",
        data: {
          warden: newWarden,
          hostel: newHostel
        },
      });
    }

    // 4. Handle Admin Setup explicitly
    if (targetRole === "admin") {
      const newAdmin = await User.create({
        name,
        email,
        password: hashPassword,
        phone,
        role: "admin"
      });

      return res.status(201).json({
        success: true,
        message: "Master Admin registered successfully",
        data: newAdmin,
      });
    }

  } catch (error) {
    console.log("Registration engine failure:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all the fields properly",
        success: false,
      });
    }

    const findUser = await User.findOne({ email });

    if (findUser && (await bcrypt.compare(password, findUser.password))) {
      return res.status(200).json({
        message: `Welcome ${findUser.name}, You are now logged in`,
        success: true,
        token: generateToken(findUser._id, findUser.role),
        user: {
          id: findUser._id,
          name: findUser.name,
          role: findUser.role, // Will now correctly report "admin", "warden", or "student"
          hostelId: findUser.hostelId || null
        }
      });
    } else {
      return res
        .status(401)
        .json({ message: "invalid email or password", success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate([
        { path: "roomId", select: "roomNumber type" },
        { path: "hostelId", select: "name" },
      ]);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User details fetched successfully",
      data: user,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
      success: false,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, email, phone } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
      success: false,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Both old and new passwords are required",
        success: false,
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect old password",
        success: false,
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to change password",
      error: error.message,
      success: false,
    });
  }
};

export const getMyRoommates = async (req, res) => {
  try {
    const studentId = req.user._id;
    const roomId = req.user.roomId;

    if (!roomId) {
      return res.status(200).json({
        success: true,
        message: "No room assignment found for this user account.",
        data: []
      });
    }

    const roomDetails = await Room.findById(roomId).populate({
      path: "occupants",
      select: "name email phone role"
    });

    if (!roomDetails) {
      return res.status(404).json({
        success: false,
        message: "Assigned room structure not found in database records."
      });
    }

    const roommates = roomDetails.occupants.filter(
      (occupant) => occupant._id.toString() !== studentId.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Roommates data compiled successfully.",
      roomNumber: roomDetails.roomNumber,
      roomType: roomDetails.type,
      data: roommates
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to compile roommate data grids.",
      error: error.message
    });
  }
};