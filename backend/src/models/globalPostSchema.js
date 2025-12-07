import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({ 
    user_id: { type: String, required: true },
    randomName: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });

const globalPostSchema = new mongoose.Schema({
      user_id: { type: String, required: true },
  randomName: { type: String, required: true },
  content: { type: String, required: true },
  images: { type: [String], default: [] },
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },
    commentsCount: { type: Number, default: 0 },
    comments: { type: [commentSchema], default: [] },

}, { timestamps: true });

export const GlobalPost = mongoose.model("GlobalPost", globalPostSchema);