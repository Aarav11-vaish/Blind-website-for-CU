import express from 'express';
import { getglobalposts, createglobalpost , likeGlobalPost } from '../controllers/globalpostcontroller.js';
import {authmiddleware} from '../middleware/authmiddleware.js';

const router = express.Router();

router.get('/getglobalposts', authmiddleware, getglobalposts);
router.post('/createglobalpost', authmiddleware, createglobalpost);
router.post('/likeglobalpost/:id/like', authmiddleware, likeGlobalPost);

export default router;