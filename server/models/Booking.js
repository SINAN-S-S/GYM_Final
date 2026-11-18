import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },

    sessionDate: {
      type: Date,
      required: false,
    },

    timeSlot: {
      type: String,
      default: "10:00 AM - 11:00 AM",
    },

    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model(
  "Booking",
  bookingSchema
);

export default Booking;