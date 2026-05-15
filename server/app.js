import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/mongodb.js";

import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import programRoutes from "./routes/program.js";
import goalsRoutes from "./routes/goalsRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import protocolRoutes from "./routes/protocolRoutes.js";
import exerciseBankRoutes from "./routes/exerciseBankRoutes.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import proteinPowderRoutes from "./routes/proteinPowderRoutes.js";
import bmiRoutes from "./routes/bmiRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Global Request Logging
app.use((req, res, next) => {
  console.log(
    `[Backend] Incoming Request: ${req.method} ${req.originalUrl}`
  );

  if (req.body && Object.keys(req.body).length > 0) {
    console.log(
      "[Backend] Request Body:",
      JSON.stringify(req.body, null, 2)
    );
  }

  next();
});

// Static Folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Home Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API Running Successfully",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/protocol", protocolRoutes);
app.use("/api/exercise-bank", exerciseBankRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/protein-powders", proteinPowderRoutes);
app.use("/api/bmi", bmiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Export App for Vercel
export default app;