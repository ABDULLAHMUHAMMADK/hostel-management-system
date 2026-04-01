import express from "express";
import { verifyUser,authorize } from "../middleware/authMiddleware.js";
import { userRegister,login,profile } from "../controllers/user.js";

const routes = express.Router();

routes.post("/", userRegister);
routes.post("/login", login );
routes.get("/profile", verifyUser,authorize(["student","admin","warden"]), profile );





export default routes;
