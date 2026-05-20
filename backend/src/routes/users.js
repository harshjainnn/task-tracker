import express from 'express';
import { getUsers } from '../controllers/users.js';
import { verifyToken, protectRoute } from '../middleware/auth.js';

const router = express.Router();

// Fetch general users directories behind secure auth shields
router.get('/', verifyToken, protectRoute, getUsers);

export default router;
