import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      refPath: "itemType",
    },

    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
    },

    itemType: {
      type: String,
      required: false,
      enum: ["Program", "ProteinPowder"],
    },

    paymentMethod: {
      type: String,
      enum: ["UPI", "Card", "GPay", "Razorpay", "DEMO"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Completed", "SUCCESS", "Failed"],
      default: "Completed",
    },

    transactionId: {
      type: String,
      default: null,
    },

    orderId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;