import express from "express";

import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Booking from "../models/Booking.js";

import { updateProfile, getProfile } from "../controllers/authController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================
// PROFILE (MUST BE BEFORE /:id)
// ======================
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// ======================
// ACCESS STATUS
// ======================
router.get("/access-status", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const purchase = await Purchase.findOne({
      user: userId,
      status: { $in: ["Completed", "SUCCESS"] },
    });
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
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ======================
// UPDATE USER BY ID (ADMIN OR SAME USER)
// ======================
router.put("/:id", protect, async (req, res) => {
  try {
    // Only admin or the user themselves can update
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Not authorized to update this user" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;