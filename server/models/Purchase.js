import mongoose from "mongoose";

// Ensure StoreCart model is registered so dynamic refPath doesn't fail when itemType is StoreCart
if (!mongoose.models.StoreCart) {
  mongoose.model("StoreCart", new mongoose.Schema({}, { strict: false }));
}

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
      enum: ["Program", "ProteinPowder", "StoreCart"],
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProteinPowder",
        },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        image: String,
      },
    ],

    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      postalCode: String,
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