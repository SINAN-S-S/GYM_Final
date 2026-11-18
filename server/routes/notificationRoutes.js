import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/my", protect, getMyNotifications);
router.put("/:id/read", protect, markAsRead);
router.put("/mark-all-read", protect, markAllAsRead);

// Admin Routes
router.post("/admin", protect, admin, createNotification);
router.delete("/admin/:id", protect, admin, deleteNotification);

export default router;

