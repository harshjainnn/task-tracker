import express from 'express';
import { signup, login, getMe } from '../controllers/auth.js';
import { verifyToken, protectRoute } from '../middleware/auth.js';
import { validateAuthLogin, validateAuthSignup } from '../middleware/validation.js';

const router = express.Router();

// Public Authentication paths
router.post('/signup', validateAuthSignup, signup);
router.post('/login', validateAuthLogin, login);

// Protected Authentication profile path
router.get('/me', verifyToken, protectRoute, getMe);

export default router;
