import mongoose from "mongoose";
const CommentSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    randomName: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });


const communitypostSchema = new mongoose.Schema({
    community_id: { type: String, required: true },

    user_id: { type: String, required: true },
    randomName: { type: String, required: true },

    content: { type: String, required: true },

    images: {
        type: [String],   // array of image URLs (Cloudinary, S3, etc.)
        default: []
    },

    likes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] }, // store user_id of likers

    comments: {
        type: [CommentSchema],
        default: []
    },

}, { timestamps: true });

export const communityPost = mongoose.model("communityPost", communitypostSchema);