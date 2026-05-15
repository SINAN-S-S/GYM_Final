import express from "express";
import upload from "../config/multer.js";

import {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programController.js";

const router = express.Router();

router.get("/", getPrograms);
router.get("/:id", getProgramById);
router.post("/", upload.single("image"), createProgram);
router.put("/:id", upload.single("image"), updateProgram);
router.delete("/:id", deleteProgram);

export default router;