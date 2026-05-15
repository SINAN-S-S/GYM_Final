import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  weight: Number,
  workoutsCompleted: Number,
  calories: Number,
  chest: Number,
  waist: Number,
  date: { type: Date, default: Date.now },
});

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;