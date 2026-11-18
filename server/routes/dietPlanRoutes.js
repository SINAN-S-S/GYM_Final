import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getMyDietPlan,
  assignDietPlan,
  getAllDietPlans,
} from "../controllers/dietPlanController.js";

const router = express.Router();

router.get("/my", protect, getMyDietPlan);
router.post("/assign", protect, admin, assignDietPlan);
router.get("/all", protect, admin, getAllDietPlans);

export default router;
