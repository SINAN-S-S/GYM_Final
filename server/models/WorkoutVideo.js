import mongoose from "mongoose";

const workoutVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Video title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Video description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Chest",
        "Back",
        "Legs",
        "Shoulders",
        "Arms",
        "Abs",
        "Cardio",
        "Full Body",
      ],
      default: "Full Body",
    },
    difficulty: {
      type: String,
      required: [true, "Difficulty level is required"],
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    duration: {
      type: Number,
      required: [true, "Duration in minutes is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail image URL is required"],
      trim: true,
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
      trim: true,
    },
    targetedMuscles: {
      type: [String],
      default: [],
    },
    equipment: {
      type: [String],
      default: ["None / Bodyweight"],
    },
    trainerName: {
      type: String,
      default: "AlphaFit Elite Coach",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound text and filter indexes
workoutVideoSchema.index({ title: "text", description: "text" });
workoutVideoSchema.index({ category: 1, difficulty: 1, isActive: 1 });

const WorkoutVideo = mongoose.model("WorkoutVideo", workoutVideoSchema);

export default WorkoutVideo;
