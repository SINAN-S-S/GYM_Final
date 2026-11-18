import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getWorkoutVideos,
  getVideoById,
  createWorkoutVideo,
  updateWorkoutVideo,
  deleteWorkoutVideo,
  toggleVideoStatus,
} from "../controllers/workoutVideoController.js";

const router = express.Router();

// Public & Member Routes
router.get("/", getWorkoutVideos);
router.get("/:id", getVideoById);

// Admin-Only Routes
router.post("/", protect, admin, createWorkoutVideo);
router.put("/:id", protect, admin, updateWorkoutVideo);
router.delete("/:id", protect, admin, deleteWorkoutVideo);
router.patch("/:id/toggle-status", protect, admin, toggleVideoStatus);

export default router;
