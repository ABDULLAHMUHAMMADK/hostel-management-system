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
export default routes;
