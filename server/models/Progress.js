import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // optional for backwards compatibility with any existing records
    },
    weight: Number,
    height: Number,
    bmi: Number,
    bodyFat: Number,
    workoutsCompleted: {
      type: mongoose.Schema.Types.Mixed,
      default: 0,
    },
    calories: Number,
    chest: Number,
    waist: Number,
    arms: Number,
    hips: Number,
    thighs: Number,
    photos: [
      {
        url: String,
        label: {
          type: String,
          default: "Progress",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: String,
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;