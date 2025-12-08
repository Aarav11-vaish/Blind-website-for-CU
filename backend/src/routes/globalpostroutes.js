import express from 'express';
import { getglobalfeed, createGlobalPost , likeGlobalPost } from '../controllers/globalpostcontroller.js';
import {authmiddleware} from '../middleware/authmiddleware.js';
import { get } from 'mongoose';

const router = express.Router();

router.get('/getglobalposts', authmiddleware, getglobalfeed);
router.post('/createglobal', authmiddleware, createGlobalPost);
router.post('/:id/like', authmiddleware, likeGlobalPost);

export default router;