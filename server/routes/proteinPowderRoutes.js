import express from "express";
import upload from "../config/multer.js";

import {
  getAllProteinPowders,
  getProteinPowderById,
  createProteinPowder,
  updateProteinPowder,
  deleteProteinPowder,
} from "../controllers/proteinPowderController.js";

const router = express.Router();

// GET all
router.get("/", getAllProteinPowders);

// GET single
router.get("/:id", getProteinPowderById);

// POST
router.post(
  "/",
  upload.single("image"),
  createProteinPowder
);

// PUT
router.put(
  "/:id",
  upload.single("image"),
  updateProteinPowder
);

// DELETE
router.delete("/:id", deleteProteinPowder);

export default router;