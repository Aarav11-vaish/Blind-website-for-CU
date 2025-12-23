import { commentCommunityMessage, deleteCommunityMessage, getCommunityMessages, likeCommunityMessage } from "../controllers/communitypostcontroller.js";
import express from "express";
import { authmiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/:community_id/messages", authmiddleware, getCommunityMessages);
router.post('/:id/like', authmiddleware, likeCommunityMessage);
router.post('/:id/comment', authmiddleware, commentCommunityMessage);
router.post('/:id/deletecomment', authmiddleware, deleteCommunityMessage);

export default router;