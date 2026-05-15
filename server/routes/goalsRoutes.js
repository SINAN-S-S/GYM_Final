import express from "express";

import * as goalsController from "../controllers/goalsController.js";

const router = express.Router();

router.get("/", goalsController.getGoals);

router.post("/", goalsController.createGoal);

router.delete("/:id", goalsController.deleteGoal);

export default router;