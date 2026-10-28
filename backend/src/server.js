import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

// Initialize Database Connection Pool
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[LuxeStay Engine] Active on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle Unhandled Promise Rejections (e.g., Database dropped mid-flight)
process.on('unhandledRejection', (err) => {
  console.error(`[CRITICAL] Unhandled Rejection: ${err.name} - ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.error(`[FATAL] Uncaught Exception: ${err.name} - ${err.message}`);
  process.exit(1);
});

// Graceful Termination Listeners (Docker / Kubernetes SIGTERM)
process.on('SIGTERM', () => {
  console.log('[SIGTERM Received] Draining active connections gracefully...');
  server.close(() => {
    console.log('[Process Terminated Cleanly]');
  });
});