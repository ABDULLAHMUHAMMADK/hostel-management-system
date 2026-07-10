import express from "express";
import { 
  getAdminDashboardMatrix, 
  generateWardenInvoices, 
  recordWardenPayment, 
  getAllWardenInvoices,
  submitContactForm,
  getAllContactMessages,
  getContactStats,
  getContactMessageById,
  updateContactStatus,
  replyToContactMessage,
  deleteContactMessage
} from "../controllers/admin.js";
import { authorize, verifyUser } from "../middleware/authMiddleware.js";

const routes = express.Router();

// 1. Fetch updated multi-tenant statistics matrix 
routes.get("/dashboard-matrix", verifyUser, authorize(["admin"]), getAdminDashboardMatrix);

// 2. Batch charge every warden operating a hostel building
routes.post("/billing/generate", verifyUser, authorize(["admin"]), generateWardenInvoices);

// 3. Mark an outstanding invoice ledger item as paid manually
routes.put("/billing/record-payment", verifyUser, authorize(["admin"]), recordWardenPayment);

routes.get("/billing/invoices", verifyUser, authorize(["admin"]), getAllWardenInvoices);






// ─── PUBLIC: Submit Contact Form ────────────────────────────────────────────
// ✅ This is PUBLIC - no authentication required
routes.post("/contact", submitContactForm);

// ─── ADMIN: Contact Management Routes ──────────────────────────────────────
// ✅ All admin routes require authentication and admin role
routes.get(
  "/contacts",
  verifyUser,
  authorize(["admin"]),
  getAllContactMessages
);

routes.get(
  "/contacts/stats",
  verifyUser,
  authorize(["admin"]),
  getContactStats
);

routes.get(
  "/contacts/:id",
  verifyUser,
  authorize(["admin"]),
  getContactMessageById
);

routes.put(
  "/contacts/:id/status",
  verifyUser,
  authorize(["admin"]),
  updateContactStatus
);

routes.post(
  "/contacts/:id/reply",
  verifyUser,
  authorize(["admin"]),
  replyToContactMessage
);

routes.delete(
  "/contacts/:id",
  verifyUser,
  authorize(["admin"]),
  deleteContactMessage
);




export default routes;