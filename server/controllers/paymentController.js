import Razorpay from "razorpay";
import crypto from "crypto";
import Purchase from "../models/Purchase.js";

// CREATE RAZORPAY ORDER
export const createOrder = async (req, res) => {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay API keys are not configured on the server",
      });
    }

    const instance = new Razorpay({
      key_id,
      key_secret,
    });

    const amount = Number(req.body.amount);
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount provided",
      });
    }

    // Amount in smallest currency unit (paise/cents)
    const subunitAmount = Math.round(amount * 100);
    const currency = req.body.currency || "INR";

    const options = {
      amount: subunitAmount,
      currency,
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate Razorpay order",
      });
    }

    res.json(order);
  } catch (error) {
    console.error("[Razorpay Order Error]", error);
    res.status(500).json({
      success: false,
      message: error.error?.description || error.message || "Payment order creation failed",
      error,
    });
  }
};

// VERIFY RAZORPAY PAYMENT
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      itemId,
      itemType,
      amount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment verification parameters",
      });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

    const expectedSign = crypto
      .createHmac("sha256", key_secret)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature verification failed!",
      });
    }

    // Check duplicate payment with this transactionId
    let purchase = await Purchase.findOne({ transactionId: razorpay_payment_id });

    if (!purchase && (itemId || req.body.items?.length) && req.user?._id) {
      const { items, shippingAddress } = req.body;
      const formattedType =
        items && items.length > 0
          ? "StoreCart"
          : itemType === "powder" || itemType === "ProteinPowder"
          ? "ProteinPowder"
          : "Program";

      // Save verified purchase to database
      purchase = await Purchase.create({
        user: req.user._id,
        itemId: itemId || null,
        itemType: formattedType,
        items: Array.isArray(items) ? items : [],
        shippingAddress: shippingAddress || null,
        paymentMethod: "Razorpay",
        amount: Number(amount) || 99,
        status: "Completed",
        transactionId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      purchase,
    });
  } catch (error) {
    console.error("[Razorpay Verify Error]", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error during payment verification",
      error: error.message,
    });
  }
};

// SIMULATE / PROCESS DEMO PAYMENT (NO REAL MONEY)
export const handleDemoPayment = async (req, res) => {
  try {
    const { itemId, itemType, amount, simulateFailure, items, shippingAddress } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const formattedType =
      items && items.length > 0
        ? "StoreCart"
        : itemType === "powder" || itemType === "ProteinPowder"
        ? "ProteinPowder"
        : "Program";

    // 1. Simulate Failure Test Mode
    if (simulateFailure === true) {
      const failedPurchase = await Purchase.create({
        user: req.user._id,
        itemId: itemId || null,
        itemType: formattedType,
        items: Array.isArray(items) ? items : [],
        shippingAddress: shippingAddress || null,
        paymentMethod: "DEMO",
        amount: Number(amount) || 99,
        status: "Failed",
        transactionId: `DEMO_FAIL_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        orderId: `DEMO_ORD_FAIL_${Date.now()}`,
      });

      return res.status(400).json({
        success: false,
        message: "Simulated payment failure (Testing Mode). No funds were charged, and membership was not activated.",
        purchase: failedPurchase,
      });
    }

    // 2. Duplicate Check: Only for programs (lifetime access). Physical supplements can be bought multiple times!
    if (itemId && formattedType === "Program") {
      const existing = await Purchase.findOne({
        user: req.user._id,
        itemId,
        status: { $in: ["Completed", "SUCCESS"] },
      });

      if (existing) {
        return res.status(200).json({
          success: true,
          alreadyOwned: true,
          message: "You already have active membership for this item!",
          purchase: existing,
        });
      }
    }

    // 3. Process Successful Demo Payment
    const demoTxnId = `DEMO_TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const demoOrderId = `DEMO_ORD_${Date.now()}`;

    const purchase = await Purchase.create({
      user: req.user._id,
      itemId: itemId || null,
      itemType: formattedType,
      items: Array.isArray(items) ? items : [],
      shippingAddress: shippingAddress || null,
      paymentMethod: "DEMO",
      amount: Number(amount) || 99,
      status: "SUCCESS",
      transactionId: demoTxnId,
      orderId: demoOrderId,
    });

    res.status(201).json({
      success: true,
      message: "Demo Payment Successful! Order confirmed.",
      purchase,
    });
  } catch (error) {
    console.error("[Demo Payment Error]", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process demo payment",
    });
  }
};
