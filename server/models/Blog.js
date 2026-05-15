import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    image: String,
    videoUrl: String,
    author: String,
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;