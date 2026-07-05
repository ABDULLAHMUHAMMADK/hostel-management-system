import express from "express";
import { createNotice, createNoticeAdmin, getAllNotices, getMyHostelNotices, getWardenNotices } from "../controllers/notice.js";
import { verifyUser, authorize } from "../middleware/authMiddleware.js";

const routes = express.Router();

routes.post("/create", verifyUser, authorize(["warden"]), createNotice);

routes.get("/my-hostel", verifyUser, authorize(["student","warden"]), getMyHostelNotices);


routes.post(
  "/admin/notices",
  verifyUser,
  authorize(["admin"]),
  createNoticeAdmin
);

// ─── WARDEN: Get notices for their hostel ──────────────────────────────────
routes.get(
  "/warden/notices",
  verifyUser,
  authorize(["warden"]),
  getWardenNotices
);

routes.get(
  "/admin/notices",
  verifyUser,
  authorize(["admin"]),
  getAllNotices
);

export default routes;