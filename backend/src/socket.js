import { Server } from "socket.io";
import CommunityMessage from './models/communitymessageschema.js';

import cloudinary from "./utils/cloudinary.js";


export const initsocket = (server)=>{
    const io = new Server(server , {
        cors:{
            origin: "*",
            methods: ["GET", "POST"]

        }
    });
    io.on("connection", (socket)=>{
        console.log("a user is conneced with ", socket.id);

        socket.on("join_community", (community_id)=>{
            socket.join(community_id);
            console.log(`user with id ${socket.id} joined community ${community_id}`);
        })
        socket.on("send_message", async(data)=>{
            try{
        const {
            community_id, 
            user_id , 
            randomName,
            message,
            images=[]
        }= data;

    
        let imageUrls = [];

        // Upload images to Cloudinary
        for (const img of images) {
          const upload = await cloudinary.uploader.upload(img, {
            folder: "community_messages",
          });
          imageUrls.push(upload.secure_url);
        }

        // Save message to DB
        const newMessage = await CommunityMessage.create({
          community_id,
          user_id,
          randomName,
          message,
          images: imageUrls,
        });

        io.to(community_id).emit("received_message", newMessage);

            }
            catch(e){
                console.log("error in socket message ", e);
                
            }
        });
socket.on("disconnect", ()=>{
    console.log("user disconnected ", socket.id);
    
})        
    })
}