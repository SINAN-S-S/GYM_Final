import ProteinPowder from "../models/ProteinPowder.js";

const getImageUrl = (req) => {
  if (req.file) {
    const url = req.file.path || req.file.secure_url || req.file.url;
    if (url && url.startsWith("http")) return url;
    const backendUrl = process.env.BACKEND_URL || "";
    return `${backendUrl}/uploads/${req.file.filename}`;
  }
  return req.body.imageUrl || undefined;
};

// GET all
export const getAllProteinPowders = async (req, res) => {
  try {
    const data = await ProteinPowder.find().sort({
      createdAt: -1,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// GET single
export const getProteinPowderById = async (req, res) => {
  try {
    const item = await ProteinPowder.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// CREATE
export const createProteinPowder = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      price,
      description,
      inStock,
    } = req.body;

    const newItem = new ProteinPowder({
      name,
      brand,
      category: category || brand || "Whey Protein",
      price: Number(price),
      description,
      inStock: inStock === "true" || inStock === true,
      image: getImageUrl(req),
    });

    const saved = await newItem.save();

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// UPDATE
export const updateProteinPowder = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      price,
      description,
      inStock,
    } = req.body;

    const data = {
      name,
      brand,
      category: category || brand || "Whey Protein",
      price: Number(price),
      description,
      inStock: inStock === "true" || inStock === true,
    };

    const imageUrl = getImageUrl(req);

    if (imageUrl) {
      data.image = imageUrl;
    }

    const updated = await ProteinPowder.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// DELETE
export const deleteProteinPowder = async (req, res) => {
  try {
    const deleted = await ProteinPowder.findByIdAndDelete(
      req.params.id
    );

    if (!deleted) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    res.json({
      message: "Deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};