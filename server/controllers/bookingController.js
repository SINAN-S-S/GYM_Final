import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";

// CREATE BOOKING (With Conflict Prevention)
export const createBooking = async (req, res) => {
  try {
    const { trainer, sessionDate, timeSlot, notes } = req.body;
    const user = req.user._id;

    if (!trainer) {
      return res.status(400).json({ msg: "Trainer is required" });
    }

    const slot = timeSlot || "10:00 AM - 11:00 AM";
    const targetDate = sessionDate ? new Date(sessionDate) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Conflict prevention check: same trainer, same date, same time slot, not cancelled
    const conflict = await Booking.findOne({
      trainer,
      timeSlot: slot,
      sessionDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["Pending", "Confirmed"] },
    });

    if (conflict) {
      return res.status(409).json({
        msg: "This trainer already has an active appointment for this date and time slot. Please choose another time.",
      });
    }

    const booking = await Booking.create({
      user,
      trainer,
      sessionDate: targetDate,
      timeSlot: slot,
      notes: notes || "Session requested from member dashboard",
      status: "Pending",
    });

    // Create notification for member
    try {
      await Notification.create({
        user,
        title: "Trainer Session Requested",
        message: `Your appointment request for ${slot} has been received and is pending confirmation.`,
        type: "appointment",
      });
    } catch (notifErr) {
      console.warn("Notification error:", notifErr.message);
    }

    const populated = await Booking.findById(booking._id).populate("trainer", "name image expertise availableTime");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET USER BOOKINGS
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate("trainer", "name image expertise availableTime")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// CANCEL USER BOOKING (MEMBER)
export const cancelUserBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found or unauthorized" });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({ msg: "Completed sessions cannot be cancelled" });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.json({ msg: "Booking cancelled successfully", booking });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET ALL BOOKINGS - ADMIN
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "username email phone name")
      .populate("trainer", "name image expertise")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// UPDATE BOOKING STATUS (ADMIN)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("user", "username email")
      .populate("trainer", "name");

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    // Send notification to user about status update
    try {
      await Notification.create({
        user: booking.user._id,
        title: `Appointment ${status}`,
        message: `Your training appointment with ${booking.trainer?.name || "Trainer"} has been marked as ${status}.`,
        type: "appointment",
      });
    } catch (notifErr) {
      console.warn("Notification error:", notifErr.message);
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE BOOKING
export const deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ msg: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};