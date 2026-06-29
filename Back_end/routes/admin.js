import express from "express";
import { 
  getAdminDashboardMatrix, 
  generateWardenInvoices, 
  recordWardenPayment, 
  getAllWardenInvoices
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

export default routes;