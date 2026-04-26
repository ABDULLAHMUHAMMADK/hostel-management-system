import express from "express";

import {
  createCheckoutSession,
  createFee,
  generateMonthlyFees,
  getStudentFees,
} from "../controllers/fee.js";
import { authorize, verifyUser } from "../middleware/authMiddleware.js";

const routes = express.Router();

routes.post("/create-fee", verifyUser, authorize(["warden"]), createFee);

routes.post(
  "/generate-fee",
  verifyUser,
  authorize(["warden"]),
  generateMonthlyFees,
);

routes.get("/my-fees", verifyUser, authorize(["student"]), getStudentFees);

routes.get("/pay-fee", verifyUser, authorize(["student"]), createCheckoutSession);


export default routes;
