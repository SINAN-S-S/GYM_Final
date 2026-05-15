import express from "express";

const router = express.Router();

import { protect, admin } from "../middleware/authMiddleware.js";

import {
  getDashboardStats,
  toggleBlockUser,
  removeUser,
  restoreUser,
  createBroadcast,
  deleteBroadcast,
  hardDeleteUser,
} from "../controllers/adminController.js";

router.get("/dashboard-stats", protect, admin, getDashboardStats);

router.post("/broadcast", protect, admin, createBroadcast);

router.delete("/broadcast/:id", protect, admin, deleteBroadcast);

router.put("/users/:id/block", protect, admin, toggleBlockUser);

router.put("/users/:id/remove", protect, admin, removeUser);

router.put("/users/:id/restore", protect, admin, restoreUser);

router.delete("/users/:id/hard-delete", protect, admin, hardDeleteUser);

export default router;