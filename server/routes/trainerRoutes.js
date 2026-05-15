import express from "express";
import upload from "../config/multer.js";
import * as trainerController from "../controllers/trainerController.js";

const router = express.Router();

router.get(
  "/",
  trainerController.getTrainers
);

router.get(
  "/:id",
  trainerController.getTrainerById
);

router.post(
  "/",
  upload.single("image"),
  trainerController.createTrainer
);

router.put(
  "/:id",
  upload.single("image"),
  trainerController.updateTrainer
);

router.delete(
  "/:id",
  trainerController.deleteTrainer
);

export default router;