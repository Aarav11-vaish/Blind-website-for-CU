import { getCommunityMessages } from "../controllers/communitypostcontroller.js";
import express from "express";
import { authmiddleware } from "../middleware/authmiddleware";

const router = express.Router();

router.get("/:community_id/messages", authmiddleware, getCommunityMessages);

export default router;