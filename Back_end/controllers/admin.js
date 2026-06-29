import { User } from "../models/user.js";
import { Hostel } from "../models/hostel.js";
import AdminFee from "../models/AdminFee.js";

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