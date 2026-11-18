import Challenge from "../models/Challenge.js";
import UserChallenge from "../models/UserChallenge.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// GET ALL ACTIVE CHALLENGES (With current user's join status)
export const getActiveChallenges = async (req, res) => {
  try {
    let challenges = await Challenge.find({ isActive: true }).sort({ createdAt: -1 });

    // Auto-seed default gym challenges if none exist
    if (challenges.length === 0) {
      const defaultChallenges = [
        {
          title: "30-Day Consistency Beast",
          description: "Check in to AlphaFit at least 20 times this month to claim the Consistency King badge.",
          category: "Monthly",
          targetMetric: "Days",
          targetNumber: 20,
          points: 250,
          badge: "Consistency King",
          isActive: true,
        },
        {
          title: "10,000 Pushups Club",
          description: "Log your pushup volume this week towards the 10,000 pushup club milestone.",
          category: "Weekly",
          targetMetric: "Reps",
          targetNumber: 1000,
          points: 150,
          badge: "Pushup Beast",
          isActive: true,
        },
        {
          title: "Cardio Crusher 50k",
          description: "Burn 5,000 kcal through high-intensity gym training and conditioning sessions.",
          category: "Daily",
          targetMetric: "Calories",
          targetNumber: 5000,
          points: 100,
          badge: "Cardio Titan",
          isActive: true,
        },
      ];
      challenges = await Challenge.insertMany(defaultChallenges);
    }

    // Fetch user participation records
    let userParticipations = [];
    if (req.user) {
      userParticipations = await UserChallenge.find({ user: req.user._id });
    }

    const participationMap = new Map();
    userParticipations.forEach((p) => {
      participationMap.set(p.challenge.toString(), p);
    });

    const result = challenges.map((ch) => {
      const userPart = participationMap.get(ch._id.toString());
      return {
        ...ch.toObject(),
        isJoined: !!userPart,
        userProgress: userPart ? userPart.currentProgress : 0,
        userStatus: userPart ? userPart.status : "Available",
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// JOIN A CHALLENGE
export const joinChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge || !challenge.isActive) {
      return res.status(404).json({ msg: "Challenge not found or no longer active" });
    }

    let userChallenge = await UserChallenge.findOne({
      user: req.user._id,
      challenge: challenge._id,
    });

    if (userChallenge) {
      return res.status(400).json({ msg: "You have already joined this challenge." });
    }

    userChallenge = await UserChallenge.create({
      user: req.user._id,
      challenge: challenge._id,
      status: "Joined",
      currentProgress: 0,
    });

    res.status(201).json({
      msg: `Joined challenge "${challenge.title}"! Push your limits!`,
      participation: userChallenge,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// COMPLETE OR UPDATE PROGRESS ON A CHALLENGE
export const updateChallengeProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ msg: "Challenge not found" });
    }

    let userChallenge = await UserChallenge.findOne({
      user: req.user._id,
      challenge: challenge._id,
    });

    if (!userChallenge) {
      userChallenge = await UserChallenge.create({
        user: req.user._id,
        challenge: challenge._id,
        status: "Joined",
        currentProgress: 0,
      });
    }

    if (userChallenge.status === "Completed") {
      return res.status(400).json({ msg: "Challenge already completed and rewards awarded." });
    }

    const newProgress = Number(progress) || (userChallenge.currentProgress + 1);
    userChallenge.currentProgress = newProgress;

    // Check if goal reached
    if (newProgress >= challenge.targetNumber) {
      userChallenge.status = "Completed";
      userChallenge.completedAt = new Date();
      userChallenge.pointsAwarded = challenge.points;

      // Award points to user
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { points: challenge.points },
      });

      // Send achievement notification
      try {
        await Notification.create({
          user: req.user._id,
          title: "Challenge Completed! 🏆",
          message: `Congratulations! You conquered "${challenge.title}" and earned ${challenge.points} leaderboard points!`,
          type: "challenge",
        });
      } catch (notifErr) {
        console.warn("Notification error:", notifErr.message);
      }
    } else {
      userChallenge.status = "In Progress";
    }

    await userChallenge.save();

    res.json({
      msg: userChallenge.status === "Completed" ? "Challenge completed!" : "Progress updated!",
      participation: userChallenge,
      pointsAwarded: userChallenge.status === "Completed" ? challenge.points : 0,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET LEADERBOARD (Ranked Members)
export const getLeaderboard = async (req, res) => {
  try {
    // Top 30 members ranked by points
    const members = await User.find({ isBlocked: { $ne: true }, isDeleted: { $ne: true } })
      .select("username points membership createdAt")
      .sort({ points: -1, createdAt: 1 })
      .limit(30);

    const leaderboard = members.map((m, index) => {
      let tierBadge = "BRONZE ATHLETE";
      if (index === 0) tierBadge = "👑 SQUAD CHAMPION";
      else if (index === 1) tierBadge = "🥈 ELITE WARRIOR";
      else if (index === 2) tierBadge = "🥉 PRO CONTENDER";
      else if ((m.points || 0) >= 300) tierBadge = "GOLD TIER";
      else if ((m.points || 0) >= 150) tierBadge = "SILVER TIER";

      return {
        rank: index + 1,
        id: m._id,
        username: m.username,
        points: m.points || 0,
        badge: tierBadge,
        membershipPlan: m.membership?.plan || "Pro Member",
      };
    });

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ADMIN: CREATE CHALLENGE
export const createChallenge = async (req, res) => {
  try {
    const { title, description, category, targetGoal, targetNumber, unit, points, badge, endDate } = req.body;

    const challenge = await Challenge.create({
      title,
      description,
      category: category || "Weekly",
      targetGoal: targetGoal || "Workout Goal",
      targetNumber: Number(targetNumber) || 5,
      unit: unit || "Workouts",
      points: Number(points) || 100,
      badge: badge || "⚡ ATHLETE",
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 14 * 86400000),
      isActive: true,
    });

    // Broadcast notification to all members about new challenge
    try {
      await Notification.create({
        user: null, // Global broadcast
        title: "New Fitness Challenge Active! 🔥",
        message: `New ${challenge.category} Challenge: "${challenge.title}". Join now to earn ${challenge.points} points!`,
        type: "challenge",
      });
    } catch (notifErr) {
      console.warn("Notification error:", notifErr.message);
    }

    res.status(201).json(challenge);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ADMIN: DELETE CHALLENGE
export const deleteChallenge = async (req, res) => {
  try {
    await Challenge.findByIdAndDelete(req.params.id);
    await UserChallenge.deleteMany({ challenge: req.params.id });
    res.json({ msg: "Challenge removed" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

