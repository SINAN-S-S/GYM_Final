import ExerciseBank from "../models/ExerciseBank.js";

const getImageUrl = (req) => {
  if (req.file) {
    const url = req.file.path || req.file.secure_url || req.file.url;
    if (url && url.startsWith("http")) return url;
    const backendUrl = process.env.BACKEND_URL || "";
    return `${backendUrl}/uploads/${req.file.filename}`;
  }
  return req.body.imageUrl || undefined;
};

// GET ALL EXERCISES
export const getExercises = async (req, res) => {
  try {
    const exercises = await ExerciseBank.find();
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE EXERCISE
export const createExercise = async (req, res) => {
  try {
    const { name, category, icon } = req.body;

    const exercise = await ExerciseBank.create({
      name,
      category,
      icon: icon || "🏋️",
      image: getImageUrl(req) || "https://via.placeholder.com/150",
    });

    res.status(201).json(exercise);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE EXERCISE
export const deleteExercise = async (req, res) => {
  try {
    await ExerciseBank.findByIdAndDelete(req.params.id);
    res.json({ message: "Exercise deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};