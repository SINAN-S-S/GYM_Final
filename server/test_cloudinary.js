import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import cloudinaryPackage from "cloudinary";

const cloudinary = cloudinaryPackage.v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async () => {
  try {
    const res = await cloudinary.uploader.upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", {
      folder: "fitness-app"
    });
    console.log("Upload success!", res.secure_url);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

uploadImage();
