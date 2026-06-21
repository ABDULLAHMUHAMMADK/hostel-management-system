import express from "express";
import {
  createComplaint,
  getHostelComplaints,
  getMyComplaints,
  resolveComplaint,
} from "../controllers/complaint.js";
import { authorize, verifyUser } from "../middleware/authMiddleware.js";

const routes = express.Router();

routes.post(
  "/create-complaint",
  verifyUser,
  authorize(["student"]),
  createComplaint,
);
routes.get(
  "/get-complaint",
  verifyUser,
  authorize(["warden"]),
  getHostelComplaints,
);
routes.patch(
  "/resolve/:complaintId",
  verifyUser,
  authorize(["warden"]),
  resolveComplaint,
);


routes.get("/my-complaints", verifyUser, authorize(["student"]), getMyComplaints);

export default routes;
