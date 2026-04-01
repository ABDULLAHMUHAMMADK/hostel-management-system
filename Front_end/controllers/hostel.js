import { User } from "../models/user.js";
import { Hostel } from "../models/hostel.js";

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
    const wardanId = req.user._id;

    const hostel = await Hostel.findOne({ warden: wardanId })
      .populate("students", "name email")
      .populate("warden", "name email");

    if (!hostel) {
      return res
        .status(400)
        .json({ message: "You did not create a hostel yet", success: false });
    }

    if (hostel.students === []) {
      await Hostel.updateOne({ students: "no students yet" });
    }

    return res
      .status(200)
      .json({ message: "heres the detail", data: hostel, success: true });
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
      select: "name email",
    });

    if (!hostel) {
      return res
        .status(404)
        .json({ message: "Hotel not found", success: false });
    }

    return res
      .status(200)
      .json({
        message: `${hostel.students.length} students found`,
        data: hostel.students,
        success: true,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
