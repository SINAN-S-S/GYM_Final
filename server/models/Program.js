import mongoose from "mongoose";

const programSchema = new mongoose.Schema({
  title: String,

  duration: String,

  level: String,

  description: String,

  videoUrl: String,
});

const Program = mongoose.model("Program", programSchema);

export default Program;