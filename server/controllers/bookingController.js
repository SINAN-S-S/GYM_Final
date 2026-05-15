import Booking from "../models/Booking.js";

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const { trainer, sessionDate, notes } = req.body;

    // User from protect middleware
    const user = req.user._id;

    const booking = await Booking.create({
      user,
      trainer,
      sessionDate,
      notes,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};

// GET USER BOOKINGS
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    }).populate(
      "trainer",
      "name image expertise"
    );

    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};

// GET ALL BOOKINGS - ADMIN
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("trainer", "name");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};

// UPDATE BOOKING STATUS
export const updateBookingStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const booking =
      await Booking.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

    if (!booking) {
      return res.status(404).json({
        msg: "Booking not found",
      });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};

// DELETE BOOKING
export const deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(
      req.params.id
    );

    res.json({
      msg: "Booking deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};