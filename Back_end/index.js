import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import userRoutes from "./routes/user.js";
import hostelRoutes from "./routes/hostel.js";
import complaintRoutes from "./routes/complaint.js";
import feeRoutes from "./routes/fee.js";
import { dbConnection } from "./config/connection.js";
const PORT = process.env.PORT;
import { User } from "./models/user.js";
import { Hostel } from "./models/hostel.js";
import { Room } from "./models/room.js";
import { Complaint } from "./models/complaint.js";
import { Fee } from "./models/fee.js";

import { stripeWebhook } from "./controllers/fee.js";
app.post(
  "/api/fee/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

app.use(express.json());

dbConnection();

app.use("/api/users", userRoutes);
app.use("/api/hostel", hostelRoutes);
app.use("/api/complaint", complaintRoutes);
app.use("/api/fee", feeRoutes);

app.get("/data/user", async (req, res) => {
  try {
    const data = await User.find();


    res.json({ message: `total users is ${data.length}`, data });
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/data/hostel", async (req, res) => {
  try {
    const data = await Hostel.find();

    res.json({ message: `total hostel is ${data.length}`, data });
  } catch (error) {
    console.log(error.message);
  }
});
app.get("/data/room", async (req, res) => {
  try {
    const data = await Room.find();

    res.json({ message: `total room is ${data.length}`, data });
  } catch (error) {
    console.log(error.message);
  }
});
app.get("/data/complaint", async (req, res) => {
  try {
    const data = await Complaint.find();

    res.json({ message: `total complain is ${data.length}`, data });
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/data/fee", async (req, res) => {
  try {
    const data = await Fee.find();

    res.json({ message: `total fee is ${data.length}`, data });
  } catch (error) {
    console.log(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
