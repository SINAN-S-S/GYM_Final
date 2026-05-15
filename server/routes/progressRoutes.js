import express from "express";
import * as progressController from "../controllers/progressController.js";

const router = express.Router();

router.get(
  "/",
  progressController.getProgressLogs
);

router.post(
  "/",
  progressController.logProgress
);

router.delete(
  "/:id",
  progressController.deleteProgressLog
);

export default router;