import Program from "../models/Program.js";

// GET ALL
export const getPrograms = async (req, res) => {
  try {
    const data = await Program.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET SINGLE
export const getProgramById = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ msg: "Program not found" });
    }
    res.json(program);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// CREATE (🔥 THIS WAS MISSING / WRONG)
export const createProgram = async (req, res) => {
  try {
    const program = await Program.create(req.body);
    res.status(201).json(program);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// UPDATE
export const updateProgram = async (req, res) => {
  try {
    const updated = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE
export const deleteProgram = async (req, res) => {
  try {
    await Program.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};