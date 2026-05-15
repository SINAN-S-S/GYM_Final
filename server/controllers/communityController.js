import CommunityPost from "../models/CommunityPost.js";

// GET ALL POSTS
export const getPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({
      createdAt: -1,
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};

// CREATE POST
export const createPost = async (req, res) => {
  try {
    if (req.user && req.user.isBlocked) {
      return res.status(403).json({
        msg: "You have been blocked from posting in the community.",
      });
    }

    const { name, plan, content } = req.body;

    // Generate Initials
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    // Random Theme Color
    const colors = [
      "#B5F23D",
      "#FF9F43",
      "#FF4D4D",
      "#38bdf8",
      "#a855f7",
    ];

    const randomColor =
      colors[Math.floor(Math.random() * colors.length)];

    const newPost = await CommunityPost.create({
      name,
      initials,
      plan: plan || "General",
      content,
      color: randomColor,
    });

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};

// LIKE POST
export const likePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(
      req.params.id
    );

    if (!post) {
      return res.status(404).json({
        msg: "Post not found",
      });
    }

    post.likes += 1;

    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};

// UPDATE POST - ADMIN
export const updatePost = async (req, res) => {
  try {
    const updated =
      await CommunityPost.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json(updated);
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};

// DELETE POST - ADMIN
export const deletePost = async (req, res) => {
  try {
    await CommunityPost.findByIdAndDelete(
      req.params.id
    );

    res.json({
      msg: "Post deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};