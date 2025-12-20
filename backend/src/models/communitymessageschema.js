import mongoose from "mongoose"

const communityMessageschema = new mongoose.Schema({
     community_id :{ type: String, required: true },
        user_id: { type: String, required: true },
        randomName: { type: String, required: true },
        message: {type: String, required:true}, 
        images: {type : [String], default : []}
}, {timestamps: true})

const CommunityMessage = mongoose.model("CommunityMessage", communityMessageschema);
export default CommunityMessage;

