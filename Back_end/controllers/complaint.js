import { Complaint } from "../models/complaint.js";

export const createComplaint = async (req, res) => {
  const { title, description } = req.body;
  const { hostelId, _id: studentId } = req.user;

  try {
    const newComplaint = new Complaint({
      title,
      description,
      studentId,
      hostelId,
    });

    const savedComplaint = await newComplaint.save();

    res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      data: savedComplaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
