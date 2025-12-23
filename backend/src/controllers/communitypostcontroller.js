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

export const likeCommunityMessage = async(req , res)=>{
    const {id}= req.params;
    const {user_id} = req.body;
    try{
        const message = await CommunityMessage.findById(id);
        if(!message) return res.status(404).json({message: "Message not found"});
         const hasLiked = message.likedBy.includes(user_id);

    if (hasLiked) {
        message.likes--;
        message.likedBy = message.likedBy.filter(uid => uid !== user_id);
        
    } else {
        message.likes++;
        message.likedBy.push(user_id);
    }
    
    await message.save();
    return res.json({ 
        message: hasLiked ? "Unliked" : "Liked",
        likes: message.likes 
      });
}
    catch(e){
console.log("error in liking community message ", e);

    }
}

export const commentCommunityMessage= async(req, res)=>{
    try{
    const {id}= req.params;
    const { user_id, randomName, comment} = req.body;
    }
    catch(e){

    }
}