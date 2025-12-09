import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './utils/errorHandler';
import { logger } from './utils/logger';
import agentsRouter from './routes/agents';
import clineRouter from './routes/cline';

// Load environment variables
dotenv.config();

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
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'autoforge-backend'
  });
});

// API Routes
app.use('/api/agents', agentsRouter);
app.use('/api/cline', clineRouter);

app.get('/api', (req, res) => {
  res.json({ 
    message: 'AutoForge API v1.0',
    endpoints: {
      health: '/health',
      agents: '/api/agents',
      cline: '/api/cline',
      tasks: '/api/tasks'
    }
  });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 AutoForge Backend running on http://localhost:${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;

