import { User } from "../models/user.js";
import { Hostel } from "../models/hostel.js";
import AdminFee from "../models/AdminFee.js";
import { Contact } from "../models/Contact.js";

export const getAdminDashboardMatrix = async (req, res) => {
  try {
    const [totalStudents, totalHostels, corporateFinancials] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Hostel.countDocuments({}),
      AdminFee.aggregate([
        {
          $group: {
            _id: null,
            totalInvoicesIssued: { $sum: 1 },
            paidInvoicesCount: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
            pendingInvoicesCount: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            totalRevenueCollected: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0] } },
            totalOutstandingRevenue: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] } },
          },
        },
      ]),
    ]);

    const stats = corporateFinancials[0] || {
      totalInvoicesIssued: 0,
      paidInvoicesCount: 0,
      pendingInvoicesCount: 0,
      totalRevenueCollected: 0,
      totalOutstandingRevenue: 0,
    };

    return res.status(200).json({
      success: true,
      message: "Master Admin administrative metric grid evaluated successfully.",
      data: {
        counters: { totalStudents, totalHostels },
        corporateBilling: {
          totalInvoicesIssued: stats.totalInvoicesIssued,
          paidInvoices: stats.paidInvoicesCount,
          pendingInvoices: stats.pendingInvoicesCount,
          revenueCollected: stats.totalRevenueCollected,
          outstandingBalance: stats.totalOutstandingRevenue,
        },
      },
    });
  } catch (err) {
    console.error("❌ Master Admin Matrix Failure:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const generateWardenInvoices = async (req, res) => {
  try {
    const { amount, month } = req.body;

    if (!amount || !month) {
      return res.status(400).json({ success: false, message: "Provide amount and target month details." });
    }

    const hostels = await Hostel.find({});
    if (hostels.length === 0) {
      return res.status(404).json({ success: false, message: "No active hostels found to invoice." });
    }

    // Check if billing was already done FOR THIS MONTH to avoid duplicates
    const billingExists = await AdminFee.findOne({ month });
    if (billingExists) {
      return res.status(400).json({
        success: false,
        message: `Corporate billing for ${month} has already been generated.`,
      });
    }

    const invoiceQueue = [];
    for (const hostel of hostels) {
      // 💡 FIXED: Find the warden assigned to THIS specific hostel using the hostel's warden reference field
      if (hostel.warden) {
        invoiceQueue.push({
          wardenId: hostel.warden,
          hostelId: hostel._id,
          amount: Number(amount),
          month: month,
          status: "pending",
        });
      }
    }

    if (invoiceQueue.length === 0) {
      return res.status(404).json({ success: false, message: "No operational wardens linked to hostels found." });
    }

    await AdminFee.insertMany(invoiceQueue);

    return res.status(201).json({
      success: true,
      message: `Successfully broadcasted lease bills to ${invoiceQueue.length} hostel wardens.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const recordWardenPayment = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await AdminFee.findByIdAndUpdate(
      invoiceId,
      { $set: { status: "paid" } },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice document not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Payment successfully received and settled.",
      data: invoice,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllWardenInvoices = async (req, res) => {
  try {
    const invoices = await AdminFee.find({})
      .populate("wardenId", "name email")
      .populate("hostelId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: invoices });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};





// ─── PUBLIC: Submit Contact Form ────────────────────────────────────────────
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Get IP and User Agent for security
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Create contact message
    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      ipAddress,
      userAgent,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon!",
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
      },
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send message. Please try again.",
    });
  }
};

// ─── ADMIN: Get All Contact Messages ────────────────────────────────────────
export const getAllContactMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, total] = await Promise.all([
      Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("repliedBy", "name email"),
      Contact.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: messages.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch messages.",
    });
  }
};

// ─── ADMIN: Get Single Contact Message ──────────────────────────────────────
export const getContactMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Contact.findById(id)
      .populate("repliedBy", "name email");

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    // Auto-mark as read if it's pending
    if (message.status === "pending") {
      message.status = "read";
      await message.save();
    }

    return res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error fetching contact message:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch message.",
    });
  }
};

// ─── ADMIN: Update Message Status ──────────────────────────────────────────
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "read", "replied", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: pending, read, replied, or archived.",
      });
    }

    const message = await Contact.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    message.status = status;
    await message.save();

    return res.status(200).json({
      success: true,
      message: `Message status updated to ${status}.`,
      data: message,
    });
  } catch (error) {
    console.error("Error updating contact status:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update message status.",
    });
  }
};

// ─── ADMIN: Reply to Message ────────────────────────────────────────────────
export const replyToContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;
    const adminId = req.user._id;

    if (!replyMessage || replyMessage.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Reply message is required.",
      });
    }

    const message = await Contact.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    message.replyMessage = replyMessage.trim();
    message.repliedBy = adminId;
    message.repliedAt = new Date();
    message.status = "replied";

    await message.save();

    const updatedMessage = await Contact.findById(id)
      .populate("repliedBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Reply sent successfully.",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Error replying to contact message:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send reply.",
    });
  }
};

// ─── ADMIN: Get Contact Stats ──────────────────────────────────────────────
export const getContactStats = async (req, res) => {
  try {
    const [total, pending, read, replied, archived] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: "pending" }),
      Contact.countDocuments({ status: "read" }),
      Contact.countDocuments({ status: "replied" }),
      Contact.countDocuments({ status: "archived" }),
    ]);

    // Get recent messages (last 5)
    const recentMessages = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email subject status createdAt");

    return res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        read,
        replied,
        archived,
      },
      recent: recentMessages,
    });
  } catch (error) {
    console.error("Error fetching contact stats:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch stats.",
    });
  }
};

// ─── ADMIN: Delete Contact Message ──────────────────────────────────────────
export const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Contact.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    await message.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete message.",
    });
  }
};