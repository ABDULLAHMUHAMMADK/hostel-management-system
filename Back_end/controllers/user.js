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

      // Check Capacity
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

    if (findUser && (await bcrypt.compare(password, findUser.password))) {
      return res.status(200).json({
        message: `Welcome ${findUser.name}, You are now loged in`,
        success: true,
        token: generateToken(findUser._id, findUser.role),
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
