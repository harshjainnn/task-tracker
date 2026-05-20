import express from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import projectsRouter from './projects.js';
import tasksRouter from './tasks.js';
import usersRouter from './users.js';
import dashboardRouter from './dashboard.js';

const router = express.Router();

/**
 * @route   GET /
 * @desc    Root API landing path
 */
router.get('/', (req, res) => {
  res.status(200).json({
    message: "Team Task Manager API Running",
    version: "1.0.0"
  });
});

// System Diagnostics checking
router.use('/health', healthRouter);

// Core REST resource routers
router.use('/api/auth', authRouter);
router.use('/api/projects', projectsRouter);
router.use('/api/tasks', tasksRouter);
router.use('/api/users', usersRouter);
router.use('/api/dashboard', dashboardRouter);

export default router;
