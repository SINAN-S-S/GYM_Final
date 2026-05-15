import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema(
  {
    title: String,

    description: String,

    level: String,

    duration: Number,

    image: String,

    video: String,

    exercises: [String],
  },
  { timestamps: true }
);

const Workout = mongoose.model("Workout", workoutSchema);

export default Workout;