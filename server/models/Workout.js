import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Full Body"],
      default: "Full Body",
    },
    description: String,
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    duration: Number,
    image: String,
    video: String,
    videoUrl: String,
    instructions: String,
    exercises: [String],
    targetMuscle: String,
  },
  { timestamps: true }
);

const Workout = mongoose.model("Workout", workoutSchema);

export default Workout;