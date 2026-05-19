import fs from "fs";
import path from "path";

const checkUpload = async () => {
  try {
    const formData = new FormData();
    formData.append("name", "Test Trainer");
    formData.append("expertise", "Test");
    formData.append("availableTime", "Test");
    formData.append("isActive", "true");
    
    // Create a dummy image file
    const blob = new Blob(["test"], { type: "image/png" });
    formData.append("image", blob, "test.png");

    const res = await fetch("http://localhost:5000/api/trainers", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    console.log("Response:", data);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUpload();
