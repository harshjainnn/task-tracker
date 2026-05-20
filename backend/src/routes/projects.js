import express from 'express';
import {
  createProject,
  getProjects,
  getSingleProject,
  updateProject,
  deleteProject,
  addProjectMember,
} from '../controllers/projects.js';
import { verifyToken, protectRoute, adminOnly } from '../middleware/auth.js';
import { validateIdParam, validateMemberBody, validateProjectBody } from '../middleware/validation.js';

const router = express.Router();

// Apply verifyToken and protectRoute to all project endpoints
router.use(verifyToken, protectRoute);

// Basic CRUD pathways
router.route('/')
  .post(adminOnly, validateProjectBody, createProject)
  .get(getProjects);

router.route('/:id')
  .get(validateIdParam(), getSingleProject)
  .put(adminOnly, validateIdParam(), validateProjectBody, updateProject)
  .delete(adminOnly, validateIdParam(), deleteProject);

// Project memberships addition pathway
router.post('/:id/members', adminOnly, validateIdParam(), validateMemberBody, addProjectMember);

export default router;
