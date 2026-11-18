import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";
import {
  getMyProgressLogs,
  getProgressLogs,
  logProgress,
  deleteProgressLog,
} from "../controllers/progressController.js";

const router = express.Router();

// Member Private Routes
router.get("/my", protect, getMyProgressLogs);
router.post("/", protect, upload.single("photo"), logProgress);
router.delete("/:id", protect, deleteProgressLog);

// Admin Routes
router.get("/all", protect, admin, getProgressLogs);
router.get("/", protect, getMyProgressLogs); // Default to member's own logs

export default router;