import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    expertise: {
      type: String,
      required: true,
    },
    availableTime: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

const Trainer = mongoose.model("Trainer", trainerSchema);

export default Trainer;