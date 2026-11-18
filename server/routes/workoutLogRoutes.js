import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createWorkoutLog,
  getMyWorkoutLogs,
  getMyWorkoutStats,
  updateWorkoutLog,
  deleteWorkoutLog,
  assignWorkoutToMember,
} from "../controllers/workoutLogController.js";

const router = express.Router();

router.post("/", protect, createWorkoutLog);
router.get("/my", protect, getMyWorkoutLogs);
router.get("/stats", protect, getMyWorkoutStats);
router.put("/:id", protect, updateWorkoutLog);
router.delete("/:id", protect, deleteWorkoutLog);

// Admin / Trainer assignment
router.post("/assign", protect, admin, assignWorkoutToMember);

export default router;
