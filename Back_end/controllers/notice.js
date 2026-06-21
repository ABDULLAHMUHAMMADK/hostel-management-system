import { Notice } from "../models/Notice.js";
import { Hostel } from "../models/Hostel.js";

export const createNotice = async (req, res) => {S
  try {
    const { title, description, category } = req.body;
    const wardenId = req.user._id;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Please fill in both the title and description fields.",
      });
    }

    // Explicitly discover which hostel is linked to this warden manager account
    const assignedHostel = await Hostel.findOne({ warden: wardenId });
    if (!assignedHostel) {
      return res.status(404).json({
        success: false,
        message: "Warden identity record lacks an explicitly assigned hostel property assignment.",
      });
    }

    const newNotice = await Notice.create({
      title,
      description,
      category: category || "general",
      hostelId: assignedHostel._id,
      createdBy: wardenId,
    });

    return res.status(201).json({
      success: true,
      message: "Notice published and broadcasted successfully.",
      data: newNotice,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Notice compilation execution crashed.",
      error: error.message,
    });
  }
};

export const getMyHostelNotices = async (req, res) => {
  try {
    const hostelId = req.user.hostelId;

    if (!hostelId) {
      return res.status(200).json({
        success: true,
        message: "No hostel assignment link found for this student account.",
        data: [],
      });
    }

    const notices = await Notice.find({ hostelId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to pull notice board configurations.",
      error: error.message,
    });
  }
};