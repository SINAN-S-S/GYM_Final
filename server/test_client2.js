import fs from "fs";

const testUpload = async () => {
  try {
    const formData = new FormData();
    const buffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
    const blob = new Blob([buffer], { type: "image/png" });
    formData.append("image", blob, "test.png");

    const res = await fetch("http://localhost:5001/test-upload", {
      method: "POST",
      body: formData
    });

    const text = await res.text();
    console.log("Response text:", text);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testUpload();
