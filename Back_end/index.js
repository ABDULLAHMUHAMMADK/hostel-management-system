import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import userRoutes from "./routes/user.js";
import hostelRoutes from "./routes/hostel.js";
import { dbConnection } from "./config/connection.js";
const PORT = process.env.PORT;
import { User } from "./models/user.js";
import { Hostel } from "./models/hostel.js";

app.use(express.json());

dbConnection();

app.use("/api/users", userRoutes);
app.use("/api/hostel", hostelRoutes);

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

    res.json({ message: `total users is ${data.length}`, data });
  } catch (error) {
    console.log(error.message);
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
