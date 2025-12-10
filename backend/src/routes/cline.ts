import { Router, Request, Response } from 'express';
import { getClineService } from '../core/ClineService';
import { CustomError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

const router = Router();
const clineService = getClineService();

// Check Cline CLI availability
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const isAvailable = await clineService.isClineAvailable();
    const version = isAvailable ? await clineService.getVersion() : null;
    const isAuthenticated = isAvailable ? await clineService.checkAuth() : false;

    res.json({
      data: {
        available: isAvailable,
        version,
        authenticated: isAuthenticated,
      },
    });
  } catch (error) {
    logger.error('Error checking Cline status:', error);
    throw new CustomError('Failed to check Cline status', 500);
  }
});

// Execute a Cline task
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { task, files, context, workingDirectory } = req.body;

    if (!task) {
      throw new CustomError('Missing required field: task', 400);
    }

    logger.info(`Executing Cline task: ${task}`);

    const result = await clineService.executeTask(
      {
        task,
        files,
        context,
      },
      workingDirectory
    );

    res.json({
      data: result,
      message: result.success ? 'Task executed successfully' : 'Task execution failed',
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Error executing Cline task:', error);
    throw new CustomError('Failed to execute Cline task', 500);
  }
});

// Execute a custom Cline command
router.post('/command', async (req: Request, res: Response) => {
  try {
    const { command, workingDirectory, timeout } = req.body;

    if (!command) {
      throw new CustomError('Missing required field: command', 400);
    }

    logger.info(`Executing Cline command: ${command}`);

    const result = await clineService.executeCommand({
      command,
      workingDirectory,
      timeout,
    });

    res.json({
      data: result,
      message: result.success ? 'Command executed successfully' : 'Command execution failed',
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Error executing Cline command:', error);
    throw new CustomError('Failed to execute Cline command', 500);
  }
});

// Get Cline version
router.get('/version', async (_req: Request, res: Response) => {
  try {
    const version = await clineService.getVersion();

    if (!version) {
      throw new CustomError('Cline CLI is not available', 404);
    }

    res.json({
      data: { version },
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Error getting Cline version:', error);
    throw new CustomError('Failed to get Cline version', 500);
  }
});

export default router;

