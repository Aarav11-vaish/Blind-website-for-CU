import mongoose from "mongoose"

const commentSchema = new mongoose.Schema({ 
    user_id: { type: String, required: true },
    randomName: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });


const communityMessageschema = new mongoose.Schema({
     community_id :{ type: String, required: true },
        user_id: { type: String, required: true },
        randomName: { type: String, required: true },
        message: {type: String, required:true}, 
        images: {type : [String], default : []}, 
        likes: { type: Number, default: 0 },
        likedBy: { type: [String], default: [] },
         commentsCount: { type: Number, default: 0 },
    comments: { type: [commentSchema], default: [] },
}, {timestamps: true})

const CommunityMessage = mongoose.model("CommunityMessage", communityMessageschema);
export default CommunityMessage;

