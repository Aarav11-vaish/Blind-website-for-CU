import express from "express";
import { signin, verifyOtp } from "../controllers/authcontroller.js";
import { authmiddleware } from "../middleware/authmiddleware.js";
const router = express.Router();

router.post("/signin", signin);
router.post("/verify-otp", verifyOtp);

export default router;
