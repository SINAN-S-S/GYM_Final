import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getActiveChallenges,
  joinChallenge,
  updateChallengeProgress,
  getLeaderboard,
  createChallenge,
  deleteChallenge,
} from "../controllers/challengeController.js";

const router = express.Router();

router.get("/", protect, getActiveChallenges);
router.get("/leaderboard", protect, getLeaderboard);
router.post("/:id/join", protect, joinChallenge);
router.put("/:id/progress", protect, updateChallengeProgress);

// Admin Routes
router.post("/admin", protect, admin, createChallenge);
router.delete("/admin/:id", protect, admin, deleteChallenge);

export default router;
