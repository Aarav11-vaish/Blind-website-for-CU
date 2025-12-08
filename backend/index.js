import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authroutes.js";
import userRoutes from "./src/routes/userroutes.js";
import communityroutes from "./src/routes/communityroutes.js";
import globalpostroutes from "./src/routes/globalpostroutes.js";
dotenv.config();
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo Connected"))
  .catch(err => console.error(err));

  
  
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  
app.get("/", (req, res) => res.send("API Running..."));
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/community", communityroutes);
app.use("/globalpost", globalpostroutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
