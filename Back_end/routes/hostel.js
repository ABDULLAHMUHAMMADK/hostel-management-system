import express from "express";
import {
  createHostel,
  getMyHostel,
  removeStudent,
  updateHostel,
  searchStudent,
  getHostelAnalytics,
  initializeRooms,
  getRoomAvailability,
  transferStudent,
  getHostelProfile,
  getStudentResidentialProfile,
  createWardenCheckoutSession,
  getMyRentInvoices,
  getStudentFees,
} from "../controllers/hostel.js";
import { verifyUser, authorize } from "../middleware/authMiddleware.js";
const routes = express.Router();

routes.post("/createHostel", verifyUser, authorize(["warden"]), createHostel);
routes.get("/getHostel", verifyUser, authorize(["warden"]), getMyHostel);
routes.delete(
  "/remove-student/:studentId",
  verifyUser,
  authorize(["warden"]),
  removeStudent,
);
routes.put("/update-hostel", verifyUser, authorize(["warden"]), updateHostel);
routes.get("/search-student", verifyUser, authorize(["warden"]), searchStudent);
routes.get("/analytics", verifyUser, authorize(["warden"]), getHostelAnalytics);

routes.post("/initialize-rooms", verifyUser, authorize(["warden"]),initializeRooms);

routes.get(
  "/availability",
  verifyUser,
  authorize(["warden"]),
  getRoomAvailability,
);

routes.put("/transfer-student/:studentId", verifyUser,authorize(["warden"]), transferStudent);
routes.get("/hostel-profile", verifyUser, authorize(["warden"]), getHostelProfile);

routes.get(
  "/residential-data", 
  verifyUser, 
  authorize(["student"]), 
  getStudentResidentialProfile
);



routes.post(
  "/warden-pay-fee", 
  verifyUser, 
  authorize(["warden"]), 
  createWardenCheckoutSession
);





routes.get("/my-rent-invoices", verifyUser, authorize(["warden"]), getMyRentInvoices);
routes.get("/student-fees", verifyUser, authorize(["warden"]), getStudentFees);

export default routes;


