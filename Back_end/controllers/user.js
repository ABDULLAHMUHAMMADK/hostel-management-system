import { User } from "../models/user.js";
import { Hostel } from "../models/hostel.js";
import { generateToken } from "../utils/Token.js";
import { Room } from "../models/room.js";
import bcrypt from "bcryptjs";

export const userRegister = async (req, res) => {
  try {
    const { name, email, password, role, hostelId, roomId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields properly",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User Already Exists",
      });
    }

    let linkedHostel = null;
    let room = null;
    let isNowFull = false;

    if (role === "student") {
      const hostelCount = await Hostel.countDocuments();
      if (hostelCount === 0) {
        return res.status(400).json({
          success: false,
          message: "There is no hostel registered yet",
        });
      }

      if (!hostelId) {
        return res.status(400).json({
          success: false,
          message: "Students must select a hostel to register",
        });
      }
      linkedHostel = await Hostel.findById(hostelId);
      if (!linkedHostel) {
        return res
          .status(404)
          .json({ success: false, message: "Hostel not found" });
      }

      if (!roomId) {
        return res
          .status(400)
          .json({ success: false, message: "Please select a room." });
      }
      room = await Room.findById(roomId);
      if (!room) {
        return res
          .status(404)
          .json({ success: false, message: "Room not found." });
      }

      if (room.occupants.length >= room.maxCapicity) {
        return res
          .status(400)
          .json({ success: false, message: "Room is already full!" });
      }

      isNowFull = room.occupants.length + 1 >= room.maxCapicity;
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      role: role || "student",
      hostelId: role === "student" ? linkedHostel?._id : hostelId || null,
      roomId: role === "student" ? roomId : null,
    });

    if (role === "student" && newUser) {
      linkedHostel.students.push(newUser._id);
      await linkedHostel.save();

      await Room.findByIdAndUpdate(roomId, {
        $push: { occupants: newUser._id },
        $set: { status: isNowFull ? "full" : "available" },
      });

      // ─── NEW REAL-TIME SOCKET BROADCAST TRIGGER ─────────────────────────────
      if (global.io) {
        try {
          // 1. Fetch updated real-time analytics numbers across the target hostel
          const totalRooms = await Room.countDocuments({ hostelId });
          
          // Sum up max capacity of all rooms to get total beds
          const roomsArray = await Room.find({ hostelId });
          const totalBeds = roomsArray.reduce((acc, curr) => acc + (curr.maxCapicity || 0), 0);
          
          // Count active resident students
          const occupiedBeds = await User.countDocuments({ hostelId, role: "student" });
          const availableBeds = Math.max(0, totalBeds - occupiedBeds);
          const occupancyPercentage = totalBeds > 0 ? `${((occupiedBeds / totalBeds) * 100).toFixed(2)}%` : "0%";

          // 2. Wrap matching structural values exactly how your front-end dashboard states read them
          const socketPayload = {
            totalRooms,
            totalBeds,
            occupiedBeds,
            availableBeds,
            hostelOccupancy: occupancyPercentage,
            hostelName: linkedHostel.name || "System Campus",
            status: occupancyPercentage === "100.00%" ? "Full" : "Active"
          };

          // 3. Beam the data straight to the warden's browser
          global.io.emit("analytics_updated", socketPayload);
          console.log("📢 Real-time dashboard update emitted successfully!");
        } catch (socketErr) {
          console.log("Socket calculation background fail logs:", socketErr.message);
        }
      }
      // ────────────────────────────────────────────────────────────────────────
    }

    return res.status(201).json({
      success: true,
      message: `${role} registered successfully`,
      data: newUser,
    });
  } catch (error) {
    console.log("Error in Register:", error.message);
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
    const user = await User.findById(req.user._id).populate([
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
