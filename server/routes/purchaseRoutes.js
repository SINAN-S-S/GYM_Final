import express from "express";

import {
  protect,
  admin,
} from "../middleware/authMiddleware.js";

import {
  createPurchase,
  getUserPurchases,
  getAllPurchases,
} from "../controllers/purchaseController.js";

const router = express.Router();

// User routes
router.post(
  "/",
  protect,
  createPurchase
);

router.get(
  "/my-purchases",
  protect,
  getUserPurchases
);

// Admin routes
router.get(
  "/",
  protect,
  admin,
  getAllPurchases
);

export default router;