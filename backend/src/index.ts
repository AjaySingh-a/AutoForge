import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './utils/errorHandler';
import { logger } from './utils/logger';
import agentsRouter from './routes/agents';
import clineRouter from './routes/cline';
import codeRabbitRouter from './routes/coderabbit';

// Load environment variables
dotenv.config();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, _promise: Promise<unknown>) => {
  logger.error('Unhandled Promise Rejection:', reason);
  // Don't exit the process, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'autoforge-backend'
  });
});

// API Routes
app.use('/api/agents', agentsRouter);
app.use('/api/cline', clineRouter);
app.use('/api/coderabbit', codeRabbitRouter);

app.get('/api', (_req, res) => {
  res.json({ 
    message: 'AutoForge API v1.0',
    endpoints: {
      health: '/health',
      agents: '/api/agents',
      cline: '/api/cline',
      coderabbit: '/api/coderabbit',
      tasks: '/api/tasks'
    }
  });
});

// Error handling
app.use(errorHandler);

// Start server only in local development
// Vercel will handle the serverless function automatically
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    logger.info(`🚀 AutoForge Backend running on http://localhost:${PORT}`);
    logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

// Export for Vercel serverless function
export default app;

