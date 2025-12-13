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
// CORS configuration - allow frontend domain or all origins in production
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'https://auto-forge-frontend.vercel.app', 'http://localhost:3000']
  : ['https://auto-forge-frontend.vercel.app', 'http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now - can restrict later
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (_req, res) => {
  res.json({ 
    message: 'AutoForge Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      agents: '/api/agents',
      cline: '/api/cline',
      coderabbit: '/api/coderabbit'
    }
  });
});

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
// Vercel's @vercel/node builder expects CommonJS export
module.exports = app;
export default app;

