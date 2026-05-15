import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

// REGISTER USER
export const register = async (req, res) => {
  try {
    const {
      username,
      email,
      phone,
      weight,
      height,
      goal,
      password,
    } = req.body;

    // Check Existing User
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        msg: "An operator with this identity already exists in the portal.",
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      username,
      email,
      phone,
      weight,
      height,
      goal,
      password: hashedPassword,
    });

    console.log(
      `[JWT Generation] Minting new token for newly registered User ID: ${user._id}`
    );

    // Generate Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "1d",
      }
    );

    // Response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        goal: user.goal,
        weight: user.weight,
        height: user.height,
      },
    });
  } catch (err) {
    res.status(500).json({
      msg: "System failure during recruitment phase",
      error: err.message,
    });
  }
};

// LOGIN USER
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login request:", email);

    const user = await User.findOne({ email });

    // User Not Found
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Block Check
    if (user.isBlocked) {
      return res.status(403).json({
        message: "User is blocked",
      });
    }

    // Password Check
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    console.log(
      `[JWT Generation] Minting new token for login User ID: ${user._id}`
    );

    // Generate Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role || "user",
      },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "7d",
      }
    );

    // Response
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      req.body,
      {
        new: true,
      }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};