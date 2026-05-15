import multer from "multer";

import { CloudinaryStorage } from "multer-storage-cloudinary";

import cloudinary from "./cloudinary.js";

import fs from "fs";

import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

let storage;

// Cloudinary Storage
if (
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== "your_key"
) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,

    params: {
      folder: "fitness-app",

      allowed_formats: ["jpg", "png", "jpeg"],
    },
  });
} else {
  // Local Storage
  const uploadDir = path.join(__dirname, "../uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
      recursive: true,
    });
  }

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
      cb(
        null,
        Date.now() + path.extname(file.originalname)
      );
    },
  });
}

const upload = multer({ storage });

export default upload;