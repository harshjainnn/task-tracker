import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.js';
import { protectRoute, verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', verifyToken, protectRoute, getDashboardStats);

export default router;
