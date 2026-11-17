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
console.log("[MULTER] Configuring storage. CLOUDINARY_API_KEY =", process.env.CLOUDINARY_API_KEY ? "SET" : "UNDEFINED");

if (
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== "your_key"
) {
  try {
    console.log("[MULTER] Using Cloudinary Storage");
    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: async (req, file) => {
        const isVideo = file.mimetype?.startsWith("video") || file.fieldname === "video";
        return {
          folder: "fitness-app",
          resource_type: isVideo ? "video" : "auto",
          allowed_formats: isVideo
            ? ["mp4", "mov", "avi", "mkv", "webm"]
            : ["jpg", "png", "jpeg", "webp", "gif"],
        };
      },
    });
  } catch (err) {
    console.error("[MULTER] Cloudinary initialization failed, falling back to memory storage:", err.message);
    storage = multer.memoryStorage();
  }
} else if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  // On Vercel / serverless: filesystem is read-only, use memory storage to avoid EROFS crashes
  console.log("[MULTER] Running in serverless without Cloudinary; using memory storage.");
  storage = multer.memoryStorage();
} else {
  // Local Storage
  const uploadDir = path.join(__dirname, "../uploads");

  try {
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
  } catch (err) {
    console.warn("[MULTER] Local uploads directory unavailable, falling back to memory storage:", err.message);
    storage = multer.memoryStorage();
  }
}

const upload = multer({ storage });

export default upload;