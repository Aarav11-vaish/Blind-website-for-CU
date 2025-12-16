import { getComunityMessages } from "../controllers/communitypostcontroller";
import express from "express";
import { authmiddleware } from "../middleware/authmiddleware";

const router = express.Router();

router.get("/:community_id/messages", authmiddleware, getComunityMessages);

export default router;