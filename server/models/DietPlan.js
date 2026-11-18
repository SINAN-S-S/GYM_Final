import mongoose from "mongoose";

const mealItemSchema = new mongoose.Schema({
  mealName: {
    type: String,
    required: true,
  },
  timeSlot: {
    type: String,
    enum: ["Breakfast", "Morning Snack", "Lunch", "Pre-Workout", "Post-Workout", "Dinner", "Night"],
    default: "Breakfast",
  },
  calories: {
    type: Number,
    default: 350,
  },
  protein: {
    type: Number,
    default: 30,
  },
  carbs: {
    type: Number,
    default: 40,
  },
  fats: {
    type: Number,
    default: 10,
  },
  foods: [String],
  notes: String,
});

const dietPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: "High Protein Performance Diet",
    },
    goal: {
      type: String,
      enum: ["Muscle Gain", "Fat Loss", "Recomposition", "Endurance"],
      default: "Muscle Gain",
    },
    targetCalories: {
      type: Number,
      required: true,
      default: 2600,
    },
    targetProtein: {
      type: Number,
      required: true,
      default: 180,
    },
    targetCarbs: {
      type: Number,
      default: 280,
    },
    targetFats: {
      type: Number,
      default: 65,
    },
    waterLiters: {
      type: Number,
      default: 3.5,
    },
    meals: [mealItemSchema],
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    instructions: {
      type: String,
      default: "Eat whole, nutrient-dense foods. Stay consistently hydrated throughout the day.",
    },
  },
  { timestamps: true }
);

dietPlanSchema.index({ user: 1, isActive: 1 });

const DietPlan = mongoose.model("DietPlan", dietPlanSchema);

export default DietPlan;
