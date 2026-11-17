import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    duration: String,
    level: String,
    description: String,
    videoUrl: String,
    image: String,
    price: {
      type: Number,
      default: 99,
    },
    frequency: {
      type: String,
      default: "5 Days/Week",
    },
    equipment: {
      type: String,
      default: "Full Gym",
    },
  },
  { timestamps: true }
);

const Program = mongoose.model("Program", programSchema);

export default Program;