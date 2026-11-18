import WorkoutLog from "../models/WorkoutLog.js";
import Notification from "../models/Notification.js";

// CREATE OR LOG A WORKOUT
export const createWorkoutLog = async (req, res) => {
  try {
    const {
      title,
      category,
      durationMinutes,
      caloriesBurned,
      exercises,
      notes,
      completed,
      date,
    } = req.body;

    const sanitizedExercises = (Array.isArray(exercises) ? exercises : []).map((ex) => ({
      name: ex.name || "Strength Exercise",
      category: ex.category || category || "Strength",
      sets: (Array.isArray(ex.sets) && ex.sets.length > 0 ? ex.sets : [{ reps: 10, weight: 0 }]).map((s, idx) => ({
        setNumber: s.setNumber || idx + 1,
        reps: Number(s.reps) || 10,
        weight: Number(s.weight) || 0,
        completed: s.completed !== false,
      })),
    }));

    const log = await WorkoutLog.create({
      user: req.user._id,
      title: title || "Strength Training Session",
      category: category || "Strength",
      durationMinutes: Number(durationMinutes) || 45,
      caloriesBurned: Number(caloriesBurned) || 300,
      exercises: sanitizedExercises,
      notes: notes || "",
      completed: completed !== false,
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      log,
      ...log.toObject(),
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET USER'S WORKOUT HISTORY & LOGS
export const getMyWorkoutLogs = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ user: req.user._id })
      .populate("assignedBy", "username name")
      .sort({ date: -1 })
      .limit(60);

    const totalWorkouts = await WorkoutLog.countDocuments({
      user: req.user._id,
      completed: true,
    });

    res.json({
      totalWorkouts,
      logs,
      workouts: logs,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET USER WORKOUT STATS (Weekly & Monthly Aggregation)
export const getMyWorkoutStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalCompleted, last7Days, last30Days] = await Promise.all([
      WorkoutLog.countDocuments({ user: userId, completed: true }),
      WorkoutLog.find({ user: userId, date: { $gte: sevenDaysAgo } }),
      WorkoutLog.find({ user: userId, date: { $gte: thirtyDaysAgo } }),
    ]);

    const weeklyVolume = last7Days.reduce((acc, log) => {
      let logWeight = 0;
      log.exercises?.forEach((ex) => {
        ex.sets?.forEach((s) => {
          logWeight += (s.weight || 0) * (s.reps || 0);
        });
      });
      return acc + logWeight;
    }, 0);

    const totalMinutes = last30Days.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);

    res.json({
      totalWorkouts: totalCompleted,
      workoutsPastWeek: last7Days.length,
      workoutsPastMonth: last30Days.length,
      weeklyVolumeLbs: weeklyVolume,
      totalMinutesPastMonth: totalMinutes,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// UPDATE WORKOUT LOG / MARK COMPLETED
export const updateWorkoutLog = async (req, res) => {
  try {
    const log = await WorkoutLog.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!log) {
      return res.status(404).json({ msg: "Workout log not found" });
    }

    const { exercises, completed, notes, durationMinutes } = req.body;
    if (exercises) log.exercises = exercises;
    if (typeof completed === "boolean") log.completed = completed;
    if (notes !== undefined) log.notes = notes;
    if (durationMinutes) log.durationMinutes = Number(durationMinutes);

    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE WORKOUT LOG
export const deleteWorkoutLog = async (req, res) => {
  try {
    await WorkoutLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    res.json({ msg: "Workout log removed" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ADMIN / TRAINER: ASSIGN WORKOUT PLAN TO MEMBER
export const assignWorkoutToMember = async (req, res) => {
  try {
    const { userId, title, category, exercises, notes } = req.body;

    if (!userId) {
      return res.status(400).json({ msg: "Target member userId is required" });
    }

    const assignedLog = await WorkoutLog.create({
      user: userId,
      title: title || "Trainer-Assigned Routine",
      category: category || "Strength",
      exercises: exercises || [],
      assignedBy: req.user._id,
      completed: false,
      notes: notes || "Assigned by your AlphaFit coach. Complete every set!",
      date: new Date(),
    });

    // Notify member
    try {
      await Notification.create({
        user: userId,
        title: "New Workout Assigned",
        message: `Your coach assigned a new workout: "${title || "Training Routine"}". Check your routine tab!`,
        type: "workout",
      });
    } catch (notifErr) {
      console.warn("Notification error:", notifErr.message);
    }

    res.status(201).json({
      msg: "Workout assigned to member successfully",
      workout: assignedLog,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

