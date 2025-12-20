import CommunityMessage from "../models/communitymessageschema.js"


export const getCommunityMessages = async( req , res)=>{
    const {community_id} = req.params;
    try{
const message =await CommunityMessage.find({community_id}).sort({createdAt: 1});
res.status(200).json(message);
    }
    catch(e){
console.log("error in getting community messages ", e);

    }

}