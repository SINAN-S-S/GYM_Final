import MembershipPlan from "../models/MembershipPlan.js";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Notification from "../models/Notification.js";

// DEFAULT MEMBERSHIP PLANS SEED IF DB IS EMPTY
const DEFAULT_PLANS = [
  {
    name: "Alpha Basic",
    tier: "Basic",
    durationMonths: 1,
    price: 39,
    description: "Standard gym floor access and cardio equipment.",
    features: [
      "Full Gym Floor Access",
      "Cardio & Weight Machine Zone",
      "Locker & Shower Facilities",
      "AlphaFit Mobile QR Attendance",
    ],
    badge: "STARTER",
    isActive: true,
  },
  {
    name: "Pro Athlete Membership",
    tier: "Pro",
    durationMonths: 3,
    price: 99,
    description: "Full access to equipment, free weights, personal coach booking & nutrition.",
    features: [
      "All Basic Facilities Included",
      "Personal Trainer Session Booking",
      "Personalized Diet & Macro Plans",
      "Elite Exercise Video Demonstrations",
      "Fitness Challenges & Leaderboard Rewards",
    ],
    badge: "MOST POPULAR",
    isActive: true,
  },
  {
    name: "VIP Elite Champion",
    tier: "VIP Elite",
    durationMonths: 12,
    price: 299,
    description: "All-inclusive yearly pass with priority trainer booking and supplement perks.",
    features: [
      "Unlimited 24/7 Priority Gym Access",
      "Dedicated Personal Trainer Assignment",
      "Bi-Weekly Body Composition & 3D Scanning",
      "10% Store Discount on All Supplements",
      "Free AlphaFit Shaker & Gym Merchandise",
    ],
    badge: "BEST VALUE",
    isActive: true,
  },
];

// GET ACTIVE MEMBERSHIP PLANS
export const getMembershipPlans = async (req, res) => {
  try {
    let plans = await MembershipPlan.find({ isActive: true }).sort({ price: 1 });

    if (plans.length === 0) {
      plans = await MembershipPlan.insertMany(DEFAULT_PLANS);
    }

    res.json(plans);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// PURCHASE OR RENEW MEMBERSHIP PLAN
export const purchaseOrRenewMembership = async (req, res) => {
  try {
    const { planId, paymentMethod, transactionId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    let plan = await MembershipPlan.findById(planId);
    if (!plan) {
      plan = DEFAULT_PLANS.find((p) => p.name === planId) || DEFAULT_PLANS[1];
    }

    const durationDays = (plan.durationMonths || 1) * 30;
    const now = new Date();

    // If existing membership is still active, extend from current expiry date; otherwise start today
    const currentExpiry = user.membership?.expiresAt ? new Date(user.membership.expiresAt) : now;
    const baseDate = currentExpiry > now ? currentExpiry : now;
    const newExpiryDate = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    user.membership = {
      plan: plan.name,
      status: "Active",
      startDate: now,
      expiresAt: newExpiryDate,
    };
    user.points = (user.points || 0) + 50; // award 50 points for membership purchase
    await user.save();

    // Log purchase
    await Purchase.create({
      user: user._id,
      itemType: "Program",
      paymentMethod: paymentMethod || "Razorpay",
      amount: plan.price,
      status: "Completed",
      transactionId: transactionId || `MEM-${Date.now()}`,
    });

    // Send confirmation notification
    try {
      await Notification.create({
        user: user._id,
        title: "Membership Activated! 🎖️",
        message: `Your "${plan.name}" is now active until ${newExpiryDate.toLocaleDateString()}. Enjoy all AlphaFit privileges!`,
        type: "membership",
      });
    } catch (notifErr) {
      console.warn("Notification error:", notifErr.message);
    }

    res.status(200).json({
      msg: `Membership successfully upgraded to ${plan.name}!`,
      membership: user.membership,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ADMIN: CREATE MEMBERSHIP PLAN
export const createMembershipPlan = async (req, res) => {
  try {
    const { name, tier, durationMonths, price, description, features, badge } = req.body;
    const plan = await MembershipPlan.create({
      name,
      tier: tier || "Pro",
      durationMonths: Number(durationMonths) || 1,
      price: Number(price),
      description: description || "",
      features: Array.isArray(features) ? features : [],
      badge: badge || "FEATURED",
      isActive: true,
    });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ADMIN: UPDATE MEMBERSHIP PLAN
export const updateMembershipPlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ msg: "Plan not found" });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ADMIN: DELETE MEMBERSHIP PLAN
export const deleteMembershipPlan = async (req, res) => {
  try {
    await MembershipPlan.findByIdAndDelete(req.params.id);
    res.json({ msg: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
