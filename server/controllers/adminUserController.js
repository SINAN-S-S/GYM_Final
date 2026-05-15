import User from "../models/User.js";

// GET ALL USERS
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      msg: "Server Error",
      error: error.message,
    });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      msg: "User deleted",
    });
  } catch (error) {
    res.status(500).json({
      msg: "Server Error",
      error: error.message,
    });
  }
};

// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({
      msg: "Server Error",
      error: error.message,
    });
  }
};