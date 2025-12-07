import {Community} from '../models/communitySchema.js';
import { User } from '../models/userschema.js';

export const getcommunities = async(req , res)=>{
    try{
        const communities = await Community.find({});
        res.json({communities});
    }
    catch(err){
     res.status(500).json({message: "Server Error"});
    }
}

export const joincommunity= async(req , res)=>{
    try{
const {user_id , Community_id} = req.body;
let user = await User.findOne({user_id});
if(!user){
    return res.status(400).json({message: "User not found"});
}
 user.joinedCommunities.push(Community_id);
await user.save();
  await Community.updateOne(
    { Community_id },
    { $inc: { memberCount: 1 } }
  );
return  res.json({message: "Joined Community Successfully"});
    }
    catch(err){
        return res.status(500).json({message: "Server Error"});
    }
}

export const leavecommunity= async(req , res)=>{
    try{
const {user_id , Community_id} = req.body;
let user = await User.findOne({user_id});
if(!user){
    return res.status(400).json({message: "User not found"});
}
 user.joinedCommunities = user.joinedCommunities.filter(
    (commId) => commId !== Community_id
  );
await user.save();
  await Community.updateOne(
    { Community_id },
    { $inc: { memberCount: -1 } }
  );
return  res.json({message: "Left Community Successfully"});
    }
    catch(err){
        return res.status(500).json({message: "Server Error"});
    }
}