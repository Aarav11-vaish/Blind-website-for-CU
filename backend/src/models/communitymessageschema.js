import mongoose from "mongoose"

const communityMessageschema = new mongoose.Schema({
     community_id :{ type: String, required: true },
        user_id: { type: String, required: true },
        randomName: { type: String, required: true },
        message: {type: String, required:true}, 
        images: {type : [string], default : []}
})

const communitymessage = mongoose.model("communitymessage", communityMessageschema);
export default communitymessage;

