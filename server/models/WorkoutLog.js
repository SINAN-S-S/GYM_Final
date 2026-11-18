import mongoose from "mongoose";

const setEntrySchema = new mongoose.Schema({
  setNumber: {
    type: Number,
    required: true,
  },
  reps: {
    type: Number,
    required: true,
    default: 10,
  },
  weight: {
    type: Number,
    required: true,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: true,
  },
});

const exerciseLogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: "Strength",
  },
  targetMuscle: {
    type: String,
    default: "General",
  },
  sets: [setEntrySchema],
  instructions: {
    type: String,
    default: "",
  },
  videoUrl: {
    type: String,
    default: "",
  },
});

const workoutLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: "Daily Workout Routine",
    },
    category: {
      type: String,
      default: "Full Body",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
    caloriesBurned: {
      type: Number,
      default: 320,
    },
    exercises: [exerciseLogSchema],
    completed: {
      type: Boolean,
      default: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

workoutLogSchema.index({ user: 1, date: -1 });

const WorkoutLog = mongoose.model("WorkoutLog", workoutLogSchema);

export default WorkoutLog;
