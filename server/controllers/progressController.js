import Progress from "../models/Progress.js";

// GET ALL PROGRESS LOGS
export const getProgressLogs = async (req, res) => {
  try {
    const logs = await Progress.find().sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE PROGRESS LOG
export const logProgress = async (req, res) => {
  try {
    const { weight, workoutsCompleted, calories, chest, waist } = req.body;

    const log = await Progress.create({
      weight,
      workoutsCompleted,
      calories,
      chest,
      waist,
    });

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE PROGRESS LOG
export const deleteProgressLog = async (req, res) => {
  try {
    await Progress.findByIdAndDelete(req.params.id);
    res.json({ message: "Log deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};