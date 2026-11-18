import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import crypto from "crypto";

// Helper to format YYYY-MM-DD
const getTodayDateString = (date = new Date()) => {
  return new Date(date).toISOString().split("T")[0];
};

// GET USER'S QR CODE DATA / TOKEN
export const getMyQR = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Generate stable hash token for member QR if not already present
    let qrToken = user.qrCode;
    if (!qrToken) {
      const secret = process.env.JWT_SECRET || "alphafit_secret";
      qrToken = `ALPHAFIT-${user._id}-${crypto.createHmac("sha256", secret).update(user._id.toString()).digest("hex").slice(0, 10)}`;
      user.qrCode = qrToken;
      await user.save();
    }

    res.json({
      qrToken,
      username: user.username,
      membership: user.membership,
      id: user._id,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// CHECK-IN VIA QR SCAN OR MEMBER ID
export const checkInMember = async (req, res) => {
  try {
    const { qrToken, userId, method } = req.body;
    let targetUser = null;

    if (qrToken) {
      // Find by exact qrCode or parse user ID from standard token format
      targetUser = await User.findOne({ qrCode: qrToken });
      if (!targetUser && qrToken.startsWith("ALPHAFIT-")) {
        const parts = qrToken.split("-");
        if (parts[1]) {
          targetUser = await User.findById(parts[1]);
        }
      }
    } else if (userId) {
      targetUser = await User.findById(userId);
    } else if (req.user) {
      targetUser = await User.findById(req.user._id);
    }

    if (!targetUser) {
      return res.status(404).json({ msg: "Invalid QR code or member not found" });
    }

    if (targetUser.isBlocked) {
      return res.status(403).json({ msg: "Member access is blocked. Please contact reception." });
    }

    const today = getTodayDateString();

    // Check if already checked in today
    const existing = await Attendance.findOne({ user: targetUser._id, date: today });
    if (existing) {
      return res.status(409).json({
        msg: `Member already checked in today at ${new Date(existing.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        attendance: existing,
      });
    }

    const methodMap = {
      qr_code: "QR_Code",
      qr_scan: "QR_SCAN",
      admin_manual: "Admin_Manual",
      manual_admin: "MANUAL_ADMIN",
      kiosk: "KIOSK",
    };
    const normalizedMethod = methodMap[(method || "").toLowerCase()] || "QR_SCAN";

    const attendance = await Attendance.create({
      user: targetUser._id,
      date: today,
      checkInTime: new Date(),
      status: "Present",
      verificationMethod: normalizedMethod,
      notes: `Verified check-in for ${targetUser.username}`,
    });

    // Award attendance workout point
    targetUser.points = (targetUser.points || 0) + 10;
    await targetUser.save();

    res.status(201).json({
      msg: `Check-in successful! Welcome, ${targetUser.username}. (+10 Points)`,
      attendance,
      user: {
        username: targetUser.username,
        membership: targetUser.membership,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// CHECK-OUT MEMBER
export const checkOutMember = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?._id;
    const today = getTodayDateString();

    const attendance = await Attendance.findOne({ user: userId, date: today });
    if (!attendance) {
      return res.status(404).json({ msg: "No check-in record found for today." });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        msg: `Already checked out at ${new Date(attendance.checkOutTime).toLocaleTimeString()}`,
      });
    }

    attendance.checkOutTime = new Date();
    attendance.status = "Checked-Out";
    await attendance.save();

    res.json({
      msg: "Check-out logged successfully. Great workout!",
      attendance,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET MEMBER ATTENDANCE HISTORY
export const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user._id })
      .sort({ checkInTime: -1 })
      .limit(60);

    const totalDays = await Attendance.countDocuments({ user: req.user._id });

    // Calculate real consecutive attendance streak
    let streak = 0;
    const uniqueDates = [...new Set(records.map((r) => r.date))].sort().reverse();
    let checkDate = new Date();
    for (let i = 0; i < uniqueDates.length; i++) {
      const dStr = getTodayDateString(checkDate);
      if (uniqueDates.includes(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yestStr = getTodayDateString(checkDate);
        if (uniqueDates.includes(yestStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    res.json({
      totalDays,
      totalCheckIns: totalDays,
      streak,
      records,
      history: records,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ADMIN: GET ALL ATTENDANCE RECORDS (With Date Filtering & Stats)
export const getAllAttendance = async (req, res) => {
  try {
    const { date, search } = req.query;
    const queryDate = date || getTodayDateString();

    const filter = { date: queryDate };

    let records = await Attendance.find(filter)
      .populate("user", "username email phone membership")
      .sort({ checkInTime: -1 });

    if (search) {
      const q = search.toLowerCase();
      records = records.filter(
        (r) =>
          r.user?.username?.toLowerCase().includes(q) ||
          r.user?.email?.toLowerCase().includes(q)
      );
    }

    const todayCount = await Attendance.countDocuments({ date: queryDate });

    res.json({
      date: queryDate,
      count: todayCount,
      records,
      logs: records,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

