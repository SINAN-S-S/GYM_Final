import mongoose from "mongoose";

const proteinPowderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    brand: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
    },

    description: {
      type: String,
    },

    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ProteinPowder = mongoose.model(
  "ProteinPowder",
  proteinPowderSchema
);

export default ProteinPowder;