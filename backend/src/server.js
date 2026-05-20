import app from './app.js';
import prisma from './config/db.js';

const PORT = process.env.PORT || 5000;

// Start Express Listener
const server = app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Team Task Manager Server Running on Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`=================================================`);
});

/**
 * Clean cleanup process on server termination.
 * Closes the HTTP listener, then gracefully closes the Prisma DB pool connections.
 */
const handleGracefulShutdown = async (signal) => {
  console.log(`\n[Process] Received signal: ${signal}. Commencing graceful teardown...`);
  
  server.close(async () => {
    console.log('[HTTP] Express listener successfully closed.');
    try {
      await prisma.$disconnect();
      console.log('[Database] Prisma client connection pool closed safely.');
      process.exit(0);
    } catch (error) {
      console.error('[Error] Failed to disconnect Prisma client safely:', error);
      process.exit(1);
    }
  });
};

// Listeners for termination signals
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
