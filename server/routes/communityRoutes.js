import express from "express";

import {
  protect,
  admin,
} from "../middleware/authMiddleware.js";

import {
  getPosts,
  createPost,
  likePost,
  updatePost,
  deletePost,
} from "../controllers/communityController.js";

const router = express.Router();

// PUBLIC / USER ROUTES
router.get("/", getPosts);

router.post("/", createPost);

router.put("/:id/like", likePost);

// ADMIN ROUTES
router.put(
  "/:id",
  protect,
  admin,
  updatePost
);

router.delete(
  "/:id",
  protect,
  admin,
  deletePost
);

export default router;