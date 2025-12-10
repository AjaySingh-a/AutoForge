import { Router, Request, Response } from 'express';
import { getAgentService } from '../services/AgentService';
import { CustomError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { AgentTask } from '../core/Agent';

const router = Router();
const agentService = getAgentService();

// Get all agents
router.get('/', async (_req: Request, res: Response) => {
  try {
    const agents = agentService.getAllAgents();
    res.json({
      data: agents,
      count: agents.length,
    });
  } catch (error) {
    logger.error('Error fetching agents:', error);
    throw new CustomError('Failed to fetch agents', 500);
  }
});

// Get specific agent
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agent = agentService.getAgent(id);

    if (!agent) {
      throw new CustomError(`Agent not found: ${id}`, 404);
    }

    res.json({ data: agent });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Error fetching agent:', error);
    throw new CustomError('Failed to fetch agent', 500);
  }
});

// Execute task with agent
router.post('/:id/execute', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, payload } = req.body;

    if (!type || !payload) {
      throw new CustomError('Missing required fields: type, payload', 400);
    }

    const task: Omit<AgentTask, 'id' | 'status'> = {
      type,
      payload,
    };

    const result = await agentService.executeTask(id, task);

    res.json({
      data: result,
      message: 'Task executed successfully',
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Error executing task:', error);
    throw new CustomError('Failed to execute task', 500);
  }
});

// Get agent status
router.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agent = agentService.getAgentStatus(id);

    if (!agent) {
      throw new CustomError(`Agent not found: ${id}`, 404);
    }

    res.json({ data: agent });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Error fetching agent status:', error);
    throw new CustomError('Failed to fetch agent status', 500);
  }
});

export default router;

