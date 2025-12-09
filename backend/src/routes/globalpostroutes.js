import express from 'express';
import { getglobalfeed, createGlobalPost , likeGlobalPost } from '../controllers/globalpostcontroller.js';
import {authmiddleware} from '../middleware/authmiddleware.js';
import { get } from 'mongoose';
import {upload} from "../middleware/upload.js";
const router = express.Router();

router.get('/getglobalposts', authmiddleware, getglobalfeed);
router.post('/createglobalposts', authmiddleware, upload.array("images", 4), createGlobalPost);
router.post('/:id/like', authmiddleware, likeGlobalPost);

export default router;