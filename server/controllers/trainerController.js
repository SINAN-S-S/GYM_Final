import Trainer from "../models/Trainer.js";

const getImageUrl = (req) => {
  if (req.file) {
    const url = req.file.path || req.file.secure_url || req.file.url;
    if (url && url.startsWith("http")) return url;
    const backendUrl = process.env.BACKEND_URL || "";
    return `${backendUrl}/uploads/${req.file.filename}`;
  }
  return req.body.imageUrl || undefined;
};

// GET ALL
export const getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE
export const getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ msg: "Trainer not found" });
    res.json(trainer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE
export const createTrainer = async (req, res) => {
  try {
    const { name, expertise, availableTime, isActive } = req.body;

    const trainer = await Trainer.create({
      name,
      expertise,
      availableTime,
      isActive: isActive === "true" || isActive === true,
      image: getImageUrl(req),
    });

    res.status(201).json(trainer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateTrainer = async (req, res) => {
  try {
    const { name, expertise, availableTime, isActive } = req.body;

    const updateData = {
      name,
      expertise,
      availableTime,
      isActive: isActive === "true" || isActive === true,
    };

    const imageUrl = getImageUrl(req);
    if (imageUrl) updateData.image = imageUrl;

    const updated = await Trainer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
export const deleteTrainer = async (req, res) => {
  try {
    await Trainer.findByIdAndDelete(req.params.id);
    res.json({ message: "Trainer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};