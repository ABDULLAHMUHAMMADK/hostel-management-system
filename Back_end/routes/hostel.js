import express from "express";
import {
  createHostel,
  getMyHostel,
  removeStudent,
  updateHostel,
  searchStudent,
  getHostelAnalytics,
  initializeRooms,
} from "../controllers/hostel.js";
import { verifyUser, authorize } from "../middleware/authMiddleware.js";
const routes = express.Router();

routes.post("/createHostel", verifyUser, authorize(["warden"]), createHostel);
routes.get("/getHostel", verifyUser, authorize(["warden"]), getMyHostel);
routes.put(
  "/remove-student/:studentId",
  verifyUser,
  authorize(["warden"]),
  removeStudent,
);
routes.put("/update-hostel", verifyUser, authorize(["warden"]), updateHostel);
routes.get("/search-student", verifyUser, authorize(["warden"]), searchStudent);
routes.get("/analytics", verifyUser, authorize(["warden"]), getHostelAnalytics);

routes.post("/initialize-rooms", verifyUser, authorize(["warden"]),initializeRooms);

export default routes;
