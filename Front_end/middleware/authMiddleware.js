import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
export const verifyUser = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decode = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decode.id).select("-password");

      next();
    } catch (error) {
      console.log(error.message);
      console.log("hello");
      return res.status(400).json({ message: error.message, success: false });
    }
  } else {
    return res
      .status(401)
      .json({ message: "No token provided", success: false });
  }
};

export const authorize = (roles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ message: "Unauthorized", success: false });
      return;
    }
    next();
  };
};
