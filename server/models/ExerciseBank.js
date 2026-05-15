import mongoose from "mongoose";

const exerciseBankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "🏋️",
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ExerciseBank = mongoose.model("ExerciseBank", exerciseBankSchema);

export default ExerciseBank;