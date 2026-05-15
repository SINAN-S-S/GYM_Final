import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["info", "urgent"],
    default: "info",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Broadcast = mongoose.model("Broadcast", broadcastSchema);

export default Broadcast;