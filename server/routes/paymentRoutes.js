import express from "express";
import {
  createOrder,
  verifyPayment,
  handleDemoPayment,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/demo", protect, handleDemoPayment);

export default router;
