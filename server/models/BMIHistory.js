import mongoose from "mongoose";

const bmiHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  weight: {
    type: Number,
    required: true,
  },

  height: {
    type: Number,
    required: true,
  },

  bmi: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const BMIHistory = mongoose.model(
  "BMIHistory",
  bmiHistorySchema
);

export default BMIHistory;