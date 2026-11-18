import express from "express";
import { chatWithAIAssistant } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", chatWithAIAssistant);

export default router;
