import express from "express";

import upload from "../config/multer.js";

import * as blogController from "../controllers/blogController.js";

const router = express.Router();

router.get("/", blogController.getBlogs);

router.post(
  "/",
  upload.single("image"),
  blogController.createBlog
);

router.put(
  "/:id",
  upload.single("image"),
  blogController.updateBlog
);

router.delete(
  "/:id",
  blogController.deleteBlog
);

export default router;