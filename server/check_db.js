import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const TrainerSchema = new mongoose.Schema({
  name: String,
  image: String,
});

const Trainer = mongoose.model("Trainer", TrainerSchema);

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const trainers = await Trainer.find().limit(5);
    console.log("Trainers:", trainers);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkData();
