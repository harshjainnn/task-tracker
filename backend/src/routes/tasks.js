import express from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from '../controllers/tasks.js';
import { verifyToken, protectRoute, adminOnly } from '../middleware/auth.js';
import {
  validateIdParam,
  validateTaskBody,
  validateTaskQuery,
  validateTaskUpdateBody,
} from '../middleware/validation.js';

const router = express.Router();

// Apply verifyToken and protectRoute to all tasks endpoints
router.use(verifyToken, protectRoute);

// Basic CRUD pathways
router.route('/')
  .post(adminOnly, validateTaskBody, createTask)
  .get(validateTaskQuery, getTasks);

router.route('/:id')
  .put(validateIdParam(), validateTaskUpdateBody, updateTask)
  .delete(adminOnly, validateIdParam(), deleteTask);

export default router;
