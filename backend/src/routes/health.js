import express from 'express';
import prisma from '../config/db.js';

const router = express.Router();

/**
 * @route   GET /health
 * @desc    App and database health diagnostics
 */
router.get('/', async (req, res) => {
  try {
    // Perform a fast SQL query test to ensure database connection is hot
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'CONNECTED',
        api: 'HEALTHY'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      services: {
        database: 'DISCONNECTED',
        api: 'DEGRADED'
      },
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database connection error'
    });
  }
});

export default router;
