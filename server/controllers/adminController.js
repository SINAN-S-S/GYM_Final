import User from "../models/User.js";
import Workout from "../models/Workout.js";
import Program from "../models/Program.js";
import CommunityPost from "../models/CommunityPost.js";
import Broadcast from "../models/Broadcast.js";
import Trainer from "../models/Trainer.js";
import Booking from "../models/Booking.js";
import Purchase from "../models/Purchase.js";
import Attendance from "../models/Attendance.js";
import Challenge from "../models/Challenge.js";
import ProteinPowder from "../models/ProteinPowder.js";
import Notification from "../models/Notification.js";

// @desc    Get comprehensive dashboard statistics from real database data
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [
      totalUsers,
      activeMembers,
      totalWorkouts,
      totalPrograms,
      totalCommunityPosts,
      totalTrainers,
      totalProducts,
      todayAttendance,
      totalBookings,
      pendingBookings,
      activeChallenges,
      allPurchases,
      recentUsers,
      broadcasts,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: { $ne: true } }),
      User.countDocuments({ "membership.status": "Active" }),
      Workout.countDocuments(),
      Program.countDocuments(),
      CommunityPost.countDocuments(),
      Trainer.countDocuments(),
      ProteinPowder.countDocuments(),
      Attendance.countDocuments({ date: today }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "Pending" }),
      Challenge.countDocuments({ isActive: true }),
      Purchase.find({ status: { $in: ["Completed", "SUCCESS"] } }).select("amount createdAt"),
      User.find({ isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .select("-password")
        .limit(6),
      Notification.find({ user: null })
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    const totalRevenue = allPurchases.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    res.json({
      totalUsers,
      activeMembers,
      totalWorkouts,
      totalPrograms,
      totalCommunityPosts,
      totalTrainers,
      totalProducts,
      todayAttendance,
      totalBookings,
      pendingBookings,
      activeChallenges,
      totalRevenue,
      recentUsers,
      broadcasts,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};

// @desc    Create a system broadcast
// @route   POST /api/admin/broadcast
// @access  Private/Admin
export const createBroadcast = async (req, res) => {
  try {
    const { message, type } = req.body;

    if (!message) {
      return res.status(400).json({
        msg: "Message is required",
      });
    }

    const broadcast = new Broadcast({
      message,
      type,
    });

    await broadcast.save();

    res.status(201).json({
      msg: "Broadcast created",
      broadcast,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};

// @desc    Toggle block status of a user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        msg: "Cannot block an admin",
      });
    }

    user.isBlocked = !user.isBlocked;

    await user.save();

    res.json({
      msg: `User ${
        user.isBlocked ? "blocked" : "unblocked"
      } successfully`,
      user,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};

// @desc    Soft delete (remove) a user
// @route   PUT /api/admin/users/:id/remove
// @access  Private/Admin
export const removeUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        msg: "Cannot remove an admin",
      });
    }

    user.isDeleted = true;

    await user.save();

    res.json({
      msg: "User removed successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};

// @desc    Restore a soft-deleted user
// @route   PUT /api/admin/users/:id/restore
// @access  Private/Admin
export const restoreUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    user.isDeleted = false;

    await user.save();

    res.json({
      msg: "User restored successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};

// @desc    Hard delete a user permanently
// @route   DELETE /api/admin/users/:id/hard-delete
// @access  Private/Admin
export const hardDeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        msg: "Cannot delete an admin",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      msg: "User permanently deleted",
    });
  } catch (err) {
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};

// @desc    Delete a system broadcast
// @route   DELETE /api/admin/broadcast/:id
// @access  Private/Admin
export const deleteBroadcast = async (req, res) => {
  try {
    const broadcast = await Broadcast.findById(req.params.id);

    if (!broadcast) {
      return res.status(404).json({
        msg: "Broadcast not found",
      });
    }

    await Broadcast.findByIdAndDelete(req.params.id);

    res.json({
      msg: "Broadcast deleted",
    });
  } catch (err) {
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};