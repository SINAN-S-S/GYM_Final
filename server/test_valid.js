import fs from "fs";

const testValidUpload = async () => {
  try {
    const formData = new FormData();
    formData.append("name", "Test Trainer 2");
    formData.append("expertise", "Test");
    formData.append("availableTime", "Test");
    formData.append("isActive", "true");
    
    // valid 1x1 png base64
    const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const buffer = Buffer.from(b64, "base64");
    const blob = new Blob([buffer], { type: "image/png" });
    formData.append("image", blob, "test2.png");

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

testValidUpload();
