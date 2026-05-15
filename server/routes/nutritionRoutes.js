import express from "express";

import {
  getAllNutrition,
  getNutritionById,
  createNutrition,
  updateNutrition,
  deleteNutrition,
} from "../controllers/nutritionController.js";

import upload from "../config/multer.js";

const router = express.Router();

// GET ALL
router.get("/", getAllNutrition);

// GET SINGLE
router.get("/:id", getNutritionById);

// CREATE
router.post(
  "/",
  upload.single("image"),
  createNutrition
);

// UPDATE
router.put(
  "/:id",
  upload.single("image"),
  updateNutrition
);

// DELETE
router.delete("/:id", deleteNutrition);

export default router;