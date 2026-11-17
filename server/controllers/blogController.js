import Blog from "../models/Blog.js";

// GET ALL BLOGS
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getImageUrl = (req) => {
  if (req.file) {
    const url = req.file.path || req.file.secure_url || req.file.url;
    if (url && url.startsWith("http")) return url;
    const backendUrl = process.env.BACKEND_URL || "";
    return `${backendUrl}/uploads/${req.file.filename}`;
  }
  return req.body.imageUrl || undefined;
};

// CREATE BLOG
export const createBlog = async (req, res) => {
  try {
    const data = { ...req.body };
    const imageUrl = getImageUrl(req);
    if (imageUrl) data.image = imageUrl;

    const blog = await Blog.create(data);
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE BLOG
export const updateBlog = async (req, res) => {
  try {
    const updateData = { ...req.body };
    const imageUrl = getImageUrl(req);
    if (imageUrl) updateData.image = imageUrl;

    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE BLOG
export const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};