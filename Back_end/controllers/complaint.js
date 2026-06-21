import { Complaint } from "../models/complaint.js";

export const createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const studentId = req.user._id;
    const hostelId = req.user.hostelId; // Extracted directly from logged-in session context

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill in the title, description, and category parameters.",
      });
    }

    if (!hostelId) {
      return res.status(400).json({
        success: false,
        message:
          "You must be assigned to a hostel facility to submit complaints.",
      });
    }

    const newComplaint = await Complaint.create({
      title,
      description,
      category,
      studentId,
      hostelId,
      status: "pending", // Default baseline configuration status
    });

    return res.status(201).json({
      success: true,
      message: "Complaint registered successfully with facility management.",
      data: newComplaint,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to dispatch maintenance ticket.",
      error: error.message,
    });
  }
};

export const getHostelComplaints = async (req, res) => {
  try {
    const { hostelId } = req.user;

    const complaints = await Complaint.find({ hostelId })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    const studentId = req.user._id;

    const complaints = await Complaint.find({ studentId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error("❌ Error in getMyComplaints:", error); // Debug console addition
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve personal complaint records.",
      error: error.message,
    });
  }
};

export const resolveComplaint = async (req, res) => {
  const { complaintId } = req.params;

  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        $set: { status: "resolved" },
      },
      {
        new: true,
      },
    );

    return res.status(200).json({ success: true, data: updatedComplaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
