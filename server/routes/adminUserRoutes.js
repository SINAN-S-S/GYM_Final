import express from "express";

const router = express.Router();

import {
  getUsers,
  deleteUser,
  updateUser,
} from "../controllers/adminUserController.js";

import {
  protect,
  admin,
} from "../middleware/authMiddleware.js";

router.get("/", protect, admin, getUsers);

router.delete("/:id", protect, admin, deleteUser);

router.put("/:id", protect, admin, updateUser);

export default router;