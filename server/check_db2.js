import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const TrainerSchema = new mongoose.Schema({
  name: String,
  image: String,
}, { timestamps: true });

const Trainer = mongoose.model("Trainer", TrainerSchema);

const NutritionSchema = new mongoose.Schema({
  title: String,
  image: String,
}, { timestamps: true });
const Nutrition = mongoose.model("Nutrition", NutritionSchema);

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const trainers = await Trainer.find().sort({ createdAt: -1 }).limit(5);
    console.log("Latest Trainers:", trainers.map(t => t.image));
    const nut = await Nutrition.find().sort({ createdAt: -1 }).limit(5);
    console.log("Latest Nutrition:", nut.map(t => t.image));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkData();
