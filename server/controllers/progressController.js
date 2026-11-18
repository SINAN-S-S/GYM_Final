import Progress from "../models/Progress.js";
import User from "../models/User.js";

// GET USER'S PRIVATE PROGRESS LOGS
export const getMyProgressLogs = async (req, res) => {
  try {
    const logs = await Progress.find({ user: req.user._id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL PROGRESS LOGS (ADMIN ONLY)
export const getProgressLogs = async (req, res) => {
  try {
    const logs = await Progress.find()
      .populate("user", "username email name")
      .sort({ date: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOG PROGRESS ENTRY (MEMBER)
export const logProgress = async (req, res) => {
  try {
    const {
      weight,
      height,
      bodyFat,
      workoutsCompleted,
      calories,
      chest,
      waist,
      arms,
      hips,
      thighs,
      notes,
      photoUrl,
      photoLabel,
    } = req.body;

    const numWeight = Number(weight) || undefined;
    const numHeight = Number(height) || req.user.height || undefined;
    
    // Calculate BMI if both height and weight are available
    let calculatedBmi = undefined;
    if (numWeight && numHeight && numHeight > 0) {
      const heightInMeters = numHeight / 100;
      calculatedBmi = Number((numWeight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    const photos = [];
    if (photoUrl) {
      photos.push({
        url: photoUrl,
        label: photoLabel || "Progress Photo",
        date: new Date(),
      });
    } else if (req.file) {
      const url = req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`;
      photos.push({
        url,
        label: photoLabel || "Progress Photo",
        date: new Date(),
      });
    }

    const log = await Progress.create({
      user: req.user._id,
      weight: numWeight,
      height: numHeight,
      bmi: calculatedBmi,
      bodyFat: Number(bodyFat) || undefined,
      workoutsCompleted: workoutsCompleted || 1,
      calories: Number(calories) || undefined,
      chest: Number(chest) || undefined,
      waist: Number(waist) || undefined,
      arms: Number(arms) || undefined,
      hips: Number(hips) || undefined,
      thighs: Number(thighs) || undefined,
      photos,
      notes: notes || "",
      date: new Date(),
    });

    // Sync latest metrics back to User profile
    if (numWeight || numHeight) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(numWeight ? { weight: numWeight } : {}),
        ...(numHeight ? { height: numHeight } : {}),
      });
    }

    // Determine BMI category
    let category = "Normal";
    if (calculatedBmi) {
      if (calculatedBmi < 18.5) category = "Underweight";
      else if (calculatedBmi < 25) category = "Normal";
      else if (calculatedBmi < 30) category = "Overweight";
      else category = "Obese";
    }

    const payload = {
      ...log.toObject(),
      bmi: calculatedBmi,
      category,
    };

    res.status(201).json({
      success: true,
      progress: payload,
      ...payload,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE PROGRESS LOG
export const deleteProgressLog = async (req, res) => {
  try {
    const query = req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

    const deleted = await Progress.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ message: "Progress entry not found" });
    }

    res.json({ message: "Progress log deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};