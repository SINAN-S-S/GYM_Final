import "dotenv/config";

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
import paymentRoutes from "./routes/paymentRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares - Placed FIRST so all responses (including 500 DB errors) include CORS headers
const allowedOrigins = [
  "https://gym-final-lake.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, uptime monitors)
    if (!origin) return callback(null, true);

    // Allow explicitly listed origins or any Vercel deployment preview / subdomains
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}));
app.use(express.json());

// URL Normalization for Vercel Serverless Functions & Single-Domain Rewrites
app.use((req, res, next) => {
  // If Vercel edge rewrite set req.url to /api/index, restore from x-matched-path or x-forwarded-uri
  const matchedPath = req.headers["x-matched-path"] || req.headers["x-forwarded-uri"];
  if (matchedPath && (req.url.startsWith("/api/index") || req.url === "/api")) {
    req.url = matchedPath;
  }
  // If the request was stripped of /api prefix (e.g. /workouts), restore it
  if (!req.url.startsWith("/api") && !req.url.startsWith("/uploads") && req.url !== "/" && req.url !== "") {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }
  next();
});

// Global Request Logging
app.use((req, res, next) => {
  console.log(
    `[Backend] Incoming Request: ${req.method} ${req.originalUrl || req.url}`
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

// Home Route / Health Check (Responds immediately for ping/uptime monitors)
app.get(["/", "/api", "/api/", "/api/health"], (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API Running Successfully",
    env: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString()
  });
});

// Connect Database for all API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("[Backend] Database Connection Error:", err.message);
    res.status(500).json({
      success: false,
      message: "DB Connection Failed",
      error: err.message,
    });
  }
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
app.use("/api/payment", paymentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Global Error Handler - Prevents Serverless Function crashes on unhandled errors
app.use((err, req, res, next) => {
  console.error("[Backend] Unhandled Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
);

if (!isServerless && process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export App for Vercel
export default app;