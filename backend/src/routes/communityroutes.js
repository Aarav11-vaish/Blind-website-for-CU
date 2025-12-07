import express from "express";
import { joincommunity, getcommunities , leavecommunity} from "../controllers/communitycontroller.js";
import { authmiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/getcommunities", authmiddleware, getcommunities);
router.post("/joincommunity", authmiddleware, joincommunity);
router.post("/leavecommunity", authmiddleware ,leavecommunity);
export default router;