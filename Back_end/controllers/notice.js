import { Notice } from "../models/Notice.js";
import { Hostel } from "../models/Hostel.js";

export const createNotice = async (req, res) => {
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



export const createNoticeAdmin = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const adminId = req.user._id;

    // Validate admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can create notices.",
      });
    }

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    // Create notice (hostelId is optional, can be null for global notices)
    const notice = await Notice.create({
      title,
      description,
      category: category || "general",
      createdBy: adminId,
    });

    // Populate for response
    const populatedNotice = await Notice.findById(notice._id)
      .populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Notice created successfully.",
      data: populatedNotice,
    });
  } catch (error) {
    console.error("Error creating notice:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllNotices = async (req, res) => {
  try {
    const { category } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;

    const notices = await Notice.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 }); // Newest first

    return res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    console.error("Error fetching notices:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getWardenNotices = async (req, res) => {
  try {
    const wardenId = req.user._id;

    // Find the hostel where this user is the warden
    const hostel = await Hostel.findOne({ warden: wardenId });
    
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "No hostel found associated with this warden account.",
      });
    }

    // Get all notices (global + hostel-specific)
    const notices = await Notice.find({
      $or: [
        { hostelId: hostel._id },
        { hostelId: { $exists: false } },
        { hostelId: null }
      ]
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    console.error("Error fetching warden notices:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};