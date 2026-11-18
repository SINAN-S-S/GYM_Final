import DietPlan from "../models/DietPlan.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// GET MEMBER'S ASSIGNED DIET PLAN
export const getMyDietPlan = async (req, res) => {
  try {
    let plan = await DietPlan.findOne({ user: req.user._id, isActive: true })
      .populate("assignedBy", "username name");

    // If no custom plan assigned yet, provide verified default high-performance meal template
    if (!plan) {
      plan = {
        title: "AlphaFit Athletic Baseline Nutrition Plan",
        goal: req.user.goal || "Muscle Gain",
        targetCalories: 2500,
        targetProtein: 165,
        targetCarbs: 270,
        targetFats: 60,
        waterLiters: 3.5,
        meals: [
          {
            mealName: "High Protein Power Breakfast",
            timeSlot: "Breakfast",
            calories: 550,
            protein: 42,
            carbs: 60,
            fats: 15,
            foods: ["4 Whole Eggs + 2 Whites", "1 Cup Rolled Oats with Berries", "1 Cup Black Coffee / Green Tea"],
            notes: "Eat within 60 minutes of waking for optimal metabolic activation.",
          },
          {
            mealName: "Lean Muscle Lunch",
            timeSlot: "Lunch",
            calories: 680,
            protein: 50,
            carbs: 75,
            fats: 18,
            foods: ["200g Grilled Chicken Breast or Paneer", "1.5 Cups Jasmine or Brown Rice", "Steamed Broccoli & Mixed Greens"],
            notes: "Provides sustained complex carbs and steady amino acid release.",
          },
          {
            mealName: "Pre-Workout Primer",
            timeSlot: "Pre-Workout",
            calories: 320,
            protein: 26,
            carbs: 45,
            fats: 5,
            foods: ["1 Scoop AlphaFit Whey Isolate", "1 Large Ripe Banana", "Rice Cakes"],
            notes: "Consume 45-60 mins before high-intensity lifting.",
          },
          {
            mealName: "Recovery & Hypertrophy Dinner",
            timeSlot: "Dinner",
            calories: 650,
            protein: 48,
            carbs: 65,
            fats: 16,
            foods: ["200g Salmon or Lean Beef or Tofu", "Baked Sweet Potato", "Large Garden Salad with Olive Oil"],
            notes: "Rich in omega-3s and antioxidants to maximize overnight protein synthesis.",
          },
        ],
        instructions: "Prioritize nutrient timing around training. Hit your daily protein target consistently.",
        isDefault: true,
      };
    }

    res.json(plan);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ADMIN: ASSIGN OR UPDATE DIET PLAN FOR MEMBER
export const assignDietPlan = async (req, res) => {
  try {
    const {
      userId,
      title,
      goal,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats,
      waterLiters,
      meals,
      instructions,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ msg: "Target member userId is required" });
    }

    // Deactivate previous active plans for this user
    await DietPlan.updateMany({ user: userId }, { isActive: false });

    const newPlan = await DietPlan.create({
      user: userId,
      title: title || "Custom Nutritional Protocol",
      goal: goal || "Muscle Gain",
      targetCalories: Number(targetCalories) || 2500,
      targetProtein: Number(targetProtein) || 160,
      targetCarbs: Number(targetCarbs) || 250,
      targetFats: Number(targetFats) || 60,
      waterLiters: Number(waterLiters) || 3.5,
      meals: Array.isArray(meals) ? meals : [],
      instructions: instructions || "Tailored by your AlphaFit coach.",
      assignedBy: req.user._id,
      isActive: true,
    });

    // Notify member
    try {
      await Notification.create({
        user: userId,
        title: "New Diet Plan Assigned",
        message: `Your coach assigned a new nutrition plan: "${newPlan.title}". View your meals schedule!`,
        type: "announcement",
      });
    } catch (notifErr) {
      console.warn("Notification error:", notifErr.message);
    }

    res.status(201).json({
      msg: "Diet plan assigned successfully",
      plan: newPlan,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ADMIN: GET ALL ASSIGNED DIET PLANS
export const getAllDietPlans = async (req, res) => {
  try {
    const plans = await DietPlan.find()
      .populate("user", "username email name")
      .populate("assignedBy", "username name")
      .sort({ createdAt: -1 });

    res.json(plans);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

