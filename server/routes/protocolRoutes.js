import express from "express";
import * as protocolController from "../controllers/protocolController.js";

const router = express.Router();

router.get(
  "/",
  protocolController.getProtocol
);

router.post(
  "/",
  protocolController.saveProtocol
);

export default router;