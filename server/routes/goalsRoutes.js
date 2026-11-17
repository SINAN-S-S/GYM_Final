import express from "express";

import * as goalsController from "../controllers/goalsController.js";

const router = express.Router();

router.get("/", goalsController.getGoals);

router.post("/", goalsController.createGoal);

router.put("/:id", goalsController.updateGoal);

router.delete("/:id", goalsController.deleteGoal);

export default router;