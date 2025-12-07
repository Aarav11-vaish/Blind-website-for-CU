import express from "express";
import { getProfile, updateProfile } from "../controllers/usercontroller.js";

const router = express.Router();

router.get("/:user_id/profile", getProfile);
router.put("/:user_id/profile/submit", updateProfile);

export default router;
