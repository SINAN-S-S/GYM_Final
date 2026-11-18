import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly"],
      default: "Weekly",
    },
    targetGoal: {
      type: String,
      required: true,
      default: "Complete 5 workouts this week",
    },
    targetNumber: {
      type: Number,
      default: 5,
    },
    unit: {
      type: String,
      default: "Workouts",
    },
    points: {
      type: Number,
      required: true,
      default: 100,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    badge: {
      type: String,
      default: "⚡ ATHLETE",
    },
  },
  { timestamps: true }
);

const Challenge = mongoose.model("Challenge", challengeSchema);

export default Challenge;
