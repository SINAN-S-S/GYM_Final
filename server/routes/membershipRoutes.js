import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getMembershipPlans,
  purchaseOrRenewMembership,
  createMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
} from "../controllers/membershipController.js";

const router = express.Router();

router.get("/plans", getMembershipPlans);
router.post("/purchase", protect, purchaseOrRenewMembership);

// Admin Routes
router.post("/admin/plans", protect, admin, createMembershipPlan);
router.put("/admin/plans/:id", protect, admin, updateMembershipPlan);
router.delete("/admin/plans/:id", protect, admin, deleteMembershipPlan);

export default router;

