import "dotenv/config";
import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./config/cloudinary.js";

const app = express();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "test-app",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage });

app.post("/test-upload", upload.single("image"), (req, res) => {
  res.json({
    file: req.file,
    body: req.body
  });
});

app.listen(5001, () => {
  console.log("Test server on 5001");
});
