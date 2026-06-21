import express from "express";
import { createNotice, getMyHostelNotices } from "../controllers/notice.js";
import { verifyUser, authorize } from "../middleware/authMiddleware.js";

const routes = express.Router();

routes.post("/create", verifyUser, authorize(["warden"]), createNotice);

routes.get("/my-hostel", verifyUser, authorize(["student","warden"]), getMyHostelNotices);

export default routes;