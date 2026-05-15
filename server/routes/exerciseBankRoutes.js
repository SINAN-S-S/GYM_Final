import express from "express";

import upload from "../config/multer.js";

import * as exerciseBankController from "../controllers/exerciseBankController.js";

import {
  protect,
  admin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC ROUTE
router.get(
  "/",
  exerciseBankController.getExercises
);

// ADMIN ROUTES
router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  exerciseBankController.createExercise
);

router.delete(
  "/:id",
  protect,
  admin,
  exerciseBankController.deleteExercise
);

export default router;