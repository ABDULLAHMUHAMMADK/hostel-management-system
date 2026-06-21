import express from "express";
import { verifyUser, authorize } from "../middleware/authMiddleware.js";
import { userRegister, login, profile, updateProfile, changePassword, getMyRoommates } from "../controllers/user.js";

const routes = express.Router();

routes.post("/", userRegister);
routes.post("/login", login);
routes.get(
  "/profile",
  verifyUser,
  authorize(["student", "admin", "warden"]),
  profile,
);
routes.put(
  "/profile/update",
  verifyUser,
  authorize(["student", "admin", "warden"]),
  updateProfile,
);

routes.put(
  "/profile/change-password",
  verifyUser,
  authorize(["student", "admin", "warden"]),
  changePassword,
);


routes.get("/my-roommates", verifyUser, authorize(["student"]), getMyRoommates);
export default routes;
