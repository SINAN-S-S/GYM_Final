import express from "express";

import {
  protect,
  admin,
} from "../middleware/authMiddleware.js";

import {
  createBooking,
  getUserBookings,
  cancelUserBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

// USER ROUTES
router.post(["/", "/book"], protect, createBooking);

router.get(
  ["/mybookings", "/my"],
  protect,
  getUserBookings
);

router.put(
  "/:id/cancel",
  protect,
  cancelUserBooking
);

// ADMIN ROUTES
router.get(["/", "/all"], protect, admin, getAllBookings);

router.put(
  ["/:id", "/:id/status"],
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