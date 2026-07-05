import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

// ─── 1. NEW SOCKET SYSTEM IMPORTS ──────────────────────────────────────────
import http from "http";
import { Server } from "socket.io";

import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";
import hostelRoutes from "./routes/hostel.js";
import complaintRoutes from "./routes/complaint.js";
import feeRoutes from "./routes/fee.js";
import noticeRoutes from "./routes/notice.js"
import { dbConnection } from "./config/connection.js";
const PORT = process.env.PORT || 5000;
import { User } from "./models/user.js";
import { Hostel } from "./models/hostel.js";
import { Room } from "./models/room.js";
import { Notice } from "./models/Notice.js";
import { Complaint } from "./models/complaint.js";
import { Fee } from "./models/fee.js";
import { stripeWebhook } from "./controllers/fee.js";
import AdminFee from "./models/AdminFee.js";

const app = express();

// ─── 2. CORS CONFIGURATION (Environment-Aware) ─────────────────────────────
// Define allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL, // Your Vercel URL (e.g., https://hms-frontend.vercel.app)
      'https://your-frontend.vercel.app', // Add your actual URL here
      // Add any other production URLs
    ]
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173'
    ];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// ─── 3. HTTP SERVER & SOCKET INITIALIZATION ────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL || 'https://your-frontend.vercel.app'
      : 'http://localhost:5173',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Make socket server globally available
global.io = io;

io.on("connection", (socket) => {
  console.log(`⚡ A user connected to live pipeline: ${socket.id}`);
  
  socket.on("disconnect", () => {
    console.log("🔌 A user disconnected from pipeline");
  });
});

// ─── 4. Apply CORS to Express App ──────────────────────────────────────────
app.use(cors(corsOptions));

// ─── 5. WEBHOOK (Must be BEFORE express.json()) ────────────────────────────
app.post(
  "/api/fee/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

// ─── 6. JSON PARSING ────────────────────────────────────────────────────────
app.use(express.json());

// ─── 7. DATABASE CONNECTION ─────────────────────────────────────────────────
dbConnection();

// ─── 8. ROUTES ──────────────────────────────────────────────────────────────
app.use("/api/users", userRoutes);
app.use("/api/hostel", hostelRoutes);
app.use("/api/complaint", complaintRoutes);
app.use("/api/fee", feeRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/admin", adminRoutes);

// ─── 9. DATA ENDPOINTS (for debugging) ──────────────────────────────────────
app.get("/data/user", async (req, res) => {
  try {
    const data = await User.find();
    res.json({ message: `total users is ${data.length}`, data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/data/hostel", async (req, res) => {
  try {
    const data = await Hostel.find();
    res.json({ message: `total hostel is ${data.length}`, data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/data/room", async (req, res) => {
  try {
    const data = await Room.find();
    res.json({ message: `total room is ${data.length}`, data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/data/complaint", async (req, res) => {
  try {
    const data = await Complaint.find();
    res.json({ message: `total complain is ${data.length}`, data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/data/fee", async (req, res) => {
  try {
    const data = await Fee.find();
    res.json({ message: `total fee is ${data.length}`, data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/data/adminfee", async (req, res) => {
  try {
    const data = await AdminFee.find();
    res.json({ message: `total fee is ${data.length}`, data });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── 10. HEALTH CHECK ENDPOINT (Good for production) ──────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ─── 11. START SERVER ──────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Origin: ${process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL || 'Production URL' : 'http://localhost:5173'}`);
});