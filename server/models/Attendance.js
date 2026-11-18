import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD for fast index matching and duplicate prevention
      required: true,
    },
    checkInTime: {
      type: Date,
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Present", "Checked-Out", "Late"],
      default: "Present",
    },
    verificationMethod: {
      type: String,
      enum: ["QR_SCAN", "MANUAL_ADMIN", "KIOSK"],
      default: "QR_SCAN",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index for fast lookup of a user's attendance on a specific date
attendanceSchema.index({ user: 1, date: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
