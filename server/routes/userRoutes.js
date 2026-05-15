import express from "express";

import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Booking from "../models/Booking.js";

import { updateProfile } from "../controllers/authController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================
// ACCESS STATUS
// ======================
router.get("/access-status", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const purchase = await Purchase.exists({ user: userId });
    const booking = await Booking.findOne({
      user: userId,
      status: "Confirmed",
    });

    const hasPurchased = !!purchase;
    const hasTrainer = !!booking;
    const isApproved = booking?.status === "Confirmed";

    res.json({
      hasPurchased,
      hasTrainer,
      isApproved,
      isLocked: !(hasPurchased && hasTrainer && isApproved),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ======================
// GET ALL USERS (ADMIN ONLY)
// ======================
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ======================
// UPDATE USER
// ======================
router.put("/:id", protect, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ======================
// PROFILE UPDATE
// ======================
router.put("/profile", protect, updateProfile);

export default router;