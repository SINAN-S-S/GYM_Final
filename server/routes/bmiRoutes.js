import express from "express";

import {
  saveBMI,
  getBMIHistory,
  getAllBMIHistory,
  deleteBMIRecord,
} from "../controllers/bmiController.js";

import {
  protect,
  admin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected Routes
router.post("/", protect, saveBMI);

router.get("/", protect, getBMIHistory);

// Admin Routes
router.get(
  "/admin/all",
  protect,
  admin,
  getAllBMIHistory
);

router.delete(
  "/admin/:id",
  protect,
  admin,
  deleteBMIRecord
);

export default router;