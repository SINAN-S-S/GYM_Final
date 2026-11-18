import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    phone: {
      type: String,
      default: "",
    },

    weight: {
      type: Number,
      default: null,
    },

    height: {
      type: Number,
      default: null,
    },

    goal: {
      type: String,
      default: "Muscle Gain",
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    membership: {
      plan: {
        type: String,
        default: "Pro Athlete Membership",
      },
      status: {
        type: String,
        enum: ["Active", "Expired", "Pending", "None"],
        default: "Active",
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      },
    },

    qrCode: {
      type: String,
      default: "",
    },

    points: {
      type: Number,
      default: 150,
    },

    assignedTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;