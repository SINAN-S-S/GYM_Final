import Purchase from "../models/Purchase.js";
import "../models/ProteinPowder.js";
import "../models/Program.js";
import "../models/User.js";

// CREATE PURCHASE
export const createPurchase = async (req, res) => {
  try {
    const {
      itemId,
      itemType,
      paymentMethod,
      amount,
      status,
      transactionId,
      orderId,
    } = req.body;

    // Duplicate transaction check
    if (transactionId) {
      const existingTxn = await Purchase.findOne({ transactionId });
      if (existingTxn) {
        return res.status(200).json({
          msg: "Purchase already recorded for this transaction",
          purchase: existingTxn,
        });
      }
    }

    const purchase = await Purchase.create({
      user: req.user._id,
      itemId,
      itemType:
        itemType === "powder" || itemType === "ProteinPowder"
          ? "ProteinPowder"
          : "Program",
      paymentMethod: paymentMethod || "Razorpay",
      amount: Number(amount),
      status: status || "Completed",
      transactionId: transactionId || null,
      orderId: orderId || null,
    });

    res.status(201).json(purchase);
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};

// GET USER PURCHASES
export const getUserPurchases = async (
  req,
  res
) => {
  try {
    const purchases = await Purchase.find({
      user: req.user._id,
    })
      .populate("itemId")
      .populate("program")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};

// GET ALL PURCHASES (ADMIN)
export const getAllPurchases = async (
  req,
  res
) => {
  try {
    const purchases = await Purchase.find()
      .populate("user", "username email name")
      .populate("itemId")
      .populate("program")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};