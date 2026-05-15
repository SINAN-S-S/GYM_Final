import express from "express";
import upload from "../config/multer.js";

import {
  createWorkout,
  getWorkouts,
  updateWorkout,
  deleteWorkout,
} from "../controllers/workoutController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

router.post("/", protect, admin, uploadFields, createWorkout);
router.get("/", getWorkouts);
router.put("/:id", protect, admin, uploadFields, updateWorkout);
router.delete("/:id", protect, admin, deleteWorkout);

export default router;