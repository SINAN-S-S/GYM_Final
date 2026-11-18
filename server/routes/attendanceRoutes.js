import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getMyQR,
  checkInMember,
  checkOutMember,
  getMyAttendance,
  getAllAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

// Member Routes
router.get("/my-qr", protect, getMyQR);
router.get(["/my-history", "/my"], protect, getMyAttendance);
router.post("/check-in", protect, checkInMember);
router.post("/check-out", protect, checkOutMember);

// Admin Routes
router.get(["/all", "/daily-logs"], protect, admin, getAllAttendance);
router.post("/admin-check-in", protect, admin, checkInMember);

export default router;

