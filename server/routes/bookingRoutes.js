import express from "express";

import {
  protect,
  admin,
} from "../middleware/authMiddleware.js";

import {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

// USER ROUTES
router.post("/", protect, createBooking);

router.get(
  "/mybookings",
  protect,
  getUserBookings
);

// ADMIN ROUTES
router.get("/", protect, admin, getAllBookings);

router.put(
  "/:id",
  protect,
  admin,
  updateBookingStatus
);

router.delete(
  "/:id",
  protect,
  admin,
  deleteBooking
);

export default router;