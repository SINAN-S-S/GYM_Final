import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = conn.connections[0].readyState;

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("DB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;