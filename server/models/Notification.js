import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // null indicates global gym-wide broadcast
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["announcement", "membership", "appointment", "challenge", "workout", "general"],
      default: "general",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    linkUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

