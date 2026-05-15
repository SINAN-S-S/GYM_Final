import Goal from "../models/goals.js";

// GET ALL GOALS
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find();
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE GOAL
export const createGoal = async (req, res) => {
  try {
    const { title, description, target } = req.body;

    const newGoal = await Goal.create({
      title,
      description,
      target,
    });

    res.status(201).json(newGoal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE GOAL
export const deleteGoal = async (req, res) => {
  try {
    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: "Goal deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};