import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    initials: {
      type: String,
    },

    plan: {
      type: String,
      default: "General",
    },

    content: {
      type: String,
      required: true,
    },

    likes: {
      type: Number,
      default: 0,
    },

    comments: {
      type: Number,
      default: 0,
    },

    color: {
      type: String,
      default: "#B5F23D",
    },
  },
  { timestamps: true }
);

const CommunityPost = mongoose.model(
  "CommunityPost",
  communityPostSchema
);

export default CommunityPost;