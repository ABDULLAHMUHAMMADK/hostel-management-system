import { User } from "../models/user.js";
import { Hostel } from "../models/hostel.js";
import { generateToken } from "../utils/Token.js";
import { Room } from "../models/room.js";
import bcrypt from "bcryptjs";

export const userRegister = async (req, res) => {
  try {
    const { name, email, password, role, hostelId, roomId } = req.body;

    if (!name || !email || !password) {
      return res.json({
        message: "please fill all the feild properley",
        success: false,
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User Already Exist",
        success: false,
      });
    }

    let linkedHostel = null;
    if (hostelId) {
      linkedHostel = await Hostel.findById(hostelId);
    }

    if (role === "student" && (await Hostel.countDocuments()) === 0) {
      return res.status(400).json({
        message: "There is no hostel register yet",
        success: false,
      });
    }

    if (role === "student" && !linkedHostel) {
      return res.status(400).json({
        message: "Students must select a hostel to register",
        success: false,
      });
    }

    if (role === "student" && !roomId) {
      return res.status(400).json({ message: "Please select a room." });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    if (room.occupants.length >= room.maxCapacity) {
      return res.status(400).json({ message: "Room is already full!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      role: role || "student",
      hostelId: role === "warden" ? null : linkedHostel._id,
      password: hashPassword,
      roomId: role === "student" ? roomId : null,
    });

    if (role === "student" && newUser) {
      linkedHostel.students.push(newUser._id);
      await linkedHostel.save();

      await Room.findByIdAndUpdate(roomId, {
        $push: { occupants: newUser._id },
      });
    }

    return res.status(201).json({
      message: "the user regester successfully",
      Data: newUser,
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
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
    const user = await User.findById(req.user._id);

    if (user) {
      return res
        .status(200)
        .json({ message: "user details", data: user, success: true });
    } else {
      return res.status(404).json({ message: "user not find", success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};
