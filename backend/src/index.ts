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
// CORS configuration - allow all origins to fix network errors
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('🌐 CORS Request from origin:', origin);
  console.log('🌐 Request method:', req.method);
  console.log('🌐 Request path:', req.path);
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-Foo, X-Bar');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS Preflight request handled');
    res.status(200).end();
    return;
  }
  
  next();
});

// Also use cors middleware as backup
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
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

