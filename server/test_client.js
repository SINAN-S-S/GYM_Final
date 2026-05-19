import fs from "fs";

const testUpload = async () => {
  try {
    const formData = new FormData();
    const blob = new Blob(["test image"], { type: "image/png" });
    formData.append("image", blob, "test.png");

    const res = await fetch("http://localhost:5001/test-upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    console.log("Req.file keys:", Object.keys(data.file || {}));
    console.log("Req.file:", data.file);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testUpload();
