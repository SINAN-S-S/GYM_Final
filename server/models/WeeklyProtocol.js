import mongoose from "mongoose";

const exerciseItemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  category: String,
  icon: String,
  image: String,
  uniqueId: Number,
});

const weeklyProtocolSchema = new mongoose.Schema(
  {
    schedule: {
      MONDAY: [exerciseItemSchema],
      TUESDAY: [exerciseItemSchema],
      WEDNESDAY: [exerciseItemSchema],
      THURSDAY: [exerciseItemSchema],
      FRIDAY: [exerciseItemSchema],
      SATURDAY: [exerciseItemSchema],
      SUNDAY: [exerciseItemSchema],
    },
  },
  { timestamps: true }
);

const WeeklyProtocol = mongoose.model("WeeklyProtocol", weeklyProtocolSchema);

export default WeeklyProtocol;