import { GlobalPost } from "../models/globalPostSchema.js";
import cloudinary from "../utils/cloudinary.js";
export const createGlobalPost = async(req , res)=>{
    try{
const { user_id, randomName, content} = req.body;
if(!user_id || !randomName || !content){
    return res.status(400).json({ message: "user_id, randomName and content are required." });
}
let imagesUrls = [];
if (req.files && req.files.length > 0) {
  for (const file of req.files) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "blind_cu_posts",
    });
    imagesUrls.push(result.secure_url);
  }
}
const newPost = new GlobalPost({
    user_id,
    randomName,
    content,
    images: imagesUrls||[]
});
await newPost.save();
res.status(201).json({ message: "Global post created successfully", post: newPost });
    }
    catch(err){
        console.log(err);
        res.status(500).json({message:"Server Error" });
    }
}

export const getglobalfeed =async(req , res)=>{
try{
const posts = await GlobalPost.find().sort({createdAt: -1});
res.status(200).json({ posts });
}   
catch
(err){
    console.log(err);
    res.status(500).json({message:"Server Error" });    
}
}



export const likeGlobalPost = async (req, res) => 
  {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const post = await GlobalPost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const hasLiked = post.likedBy.includes(user_id);

    if (hasLiked) {
      post.likes--;
      post.likedBy = post.likedBy.filter(uid => uid !== user_id);
    } else {
      post.likes++;
      post.likedBy.push(user_id);
    }

    await post.save();
    return res.json({ 
      message: hasLiked ? "Unliked" : "Liked",
      likes: post.likes 
    });

  } catch (err) {
    console.error("Like Global Post Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const commentGlobalPost= async(req, res)=>{
  try{
const {id}= req.params;
const { user_id, randomName, comment} = req.body;
if(!comment){
return  res.status(400).json({message: "comment cannot be empty"});
}
const post = await GlobalPost.findById(id);
if(!post){
  return res.status(404).json({message: "Post not found"});
} 
const newComment = {
  user_id ,
  randomName, 
  content: comment
}
post.comments.push(newComment);
post.commentsCount = post.comments.length;
await post.save();
return res.status(201).json({ message: "Comment added successfully", comment: newComment});
}
  catch(e){
    console.log("error in commenting global post ", e);
  }
}