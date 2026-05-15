import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  title: String,
  description: String,
  target: Number,
  current: { type: Number, default: 0 },
});

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;