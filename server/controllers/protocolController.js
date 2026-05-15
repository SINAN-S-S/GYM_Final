import WeeklyProtocol from "../models/WeeklyProtocol.js";

// GET PROTOCOL
export const getProtocol = async (req, res) => {
  try {
    const protocol = await WeeklyProtocol.findOne();

    if (protocol) {
      res.json(protocol);
    } else {
      res.json(null);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SAVE / UPDATE PROTOCOL
export const saveProtocol = async (req, res) => {
  try {
    const { schedule } = req.body;

    let protocol = await WeeklyProtocol.findOne();

    if (protocol) {
      protocol.schedule = schedule;
      await protocol.save();
    } else {
      protocol = await WeeklyProtocol.create({ schedule });
    }

    res.status(200).json(protocol);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};