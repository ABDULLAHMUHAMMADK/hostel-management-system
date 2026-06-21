import { User } from "../models/user.js";
import { Hostel } from "../models/hostel.js";
import { generateToken } from "../utils/Token.js";
import { Room } from "../models/room.js";
import bcrypt from "bcryptjs";


export const userRegister = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Core structural validations for EVERYONE
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill name, email, and password fields properly",
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
    // 2. Handle Student Setup explicitly
    if (targetRole === "student") {
      console.log("hello")
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

      if (room.occupants.length >= room.maxCapicity) {
        return res.status(400).json({ success: false, message: "Room is already full!" });
      }

      const isNowFull = room.occupants.length + 1 >= room.maxCapicity;

      // Safe password hash setup
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      // Create Student
      const newStudent = await User.create({
        name,
        email,
        password: hashPassword,
        role: "student",
        hostelId,
        roomId
      });

      // Update structural links
      linkedHostel.students.push(newStudent._id);
      await linkedHostel.save();

      await Room.findByIdAndUpdate(roomId, {
        $push: { occupants: newStudent._id },
        $set: { status: isNowFull ? "full" : "available" },
      });
console.log("hello")
      // Sockets live updates stream
      if (global.io) {
        try {
          const totalRooms = await Room.countDocuments({ hostelId });
          const roomsArray = await Room.find({ hostelId });
          const totalBeds = roomsArray.reduce((acc, curr) => acc + (curr.maxCapicity || 0), 0);
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
    // 3. Handle Warden Setup explicitly (Ignores hostelId & roomId completely during registration)
    if (targetRole === "warden") {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
console.log("hello")
      const newWarden = await User.create({
        name,
        email,
        password: hashPassword,
        role: "warden",
        // Forces these fields to be completely absent/undefined so MongoDB bypasses validations
        hostelId: undefined, 
        roomId: undefined
      });

      return res.status(201).json({
        success: true,
        message: "Warden registered successfully without property ties",
        data: newWarden,
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

    const findUser = await User.findOne({
      email,
    });

    // if (findUser && (await bcrypt.compare(password, findUser.password))) {
    //   return res.status(200).json({
    //     message: `Welcome ${findUser.name}, You are now loged in`,
    //     success: true,
    //     token: generateToken(findUser._id, findUser.role),
    //   });
    // } 
    
    
    
    if (findUser && (await bcrypt.compare(password, findUser.password))) {
      return res.status(200).json({
        message: `Welcome ${findUser.name}, You are now loged in`,
        success: true,
        token: generateToken(findUser._id, findUser.role),
        // ADD THIS LINE HERE: Sends the necessary profile properties straight to React
        user: {
          id: findUser._id,
          name: findUser.name,
          role: findUser.role, // "warden" or "student"
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
    // Added .select("-password") to ensure security hashes never leak to the client side
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate([
        {
          path: "roomId",
          select: "roomNumber type",
        },
        {
          path: "hostelId",
          select: "name",
        },
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

    // Find the user and update only the allowed fields
    // { new: true } returns the updated document instead of the old one
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $set: { 
          name, 
          email, 
          phone 
        } 
      },
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

    // Find the user with the password included explicitly
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect old password",
        success: false,
      });
    }

    // Hash the new password before saving
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

    // 1. If the student doesn't have a room assigned yet, return an empty array gracefully
    if (!roomId) {
      return res.status(200).json({
        success: true,
        message: "No room assignment found for this user account.",
        data: []
      });
    }

    // 2. Find the room and populate the occupants array with their names, emails, and phone numbers
    const roomDetails = await Room.findById(roomId)
      .populate({
        path: "occupants",
        select: "name email phone role"
      });

    if (!roomDetails) {
      return res.status(404).json({
        success: false,
        message: "Assigned room structure not found in database records."
      });
    }

    // 3. Filter out the logged-in student so they only see their *roommates*, not themselves
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



