import mongoose, { mongo } from "mongoose";
import { Community } from "./src/models/controllerSchema.js";
import dotenv from "dotenv";

dotenv.config();
mongoose.connect(process.env.MONGO_URI);
const communities = [
  {
    community_id: "placements",
    name: "Placements",
    description: "Discuss interviews, companies, salaries, referrals"
  },
  {
    community_id: "exams",
    name: "Exams & Academics",
    description: "Share notes, doubts, exam tips"
  },
  {
    community_id: "gossip",
    name: "CU Gossip",
    description: "Fun, anonymous talks"
  },
  {
community_id: "marketplace", 
name:"buy/sell marketplace", 
description: "Buy/sell books, gadgets, services"
  },

  {
    community_id: "hostel",
    name: "Hostel Life",
    description: "Roommates, food, issues"
  },
];

async function insertCommunities() {
    try{
await Community.insertMany(communities);
console.log("Communities inserted successfully");
mongoose.connection.close();
    }
    catch(err){
        console.error("Error inserting communities:", err);
    }
}
insertCommunities();