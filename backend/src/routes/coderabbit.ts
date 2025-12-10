import { Router, Request, Response } from 'express';
import { getCodeRabbitService } from '../core/coderabbit/CodeRabbitService';
import { getAgentService } from '../services/AgentService';
import { CustomError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

const router = Router();
const codeRabbitService = getCodeRabbitService();
const agentService = getAgentService();

// Check GitHub and CodeRabbit connectivity
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await codeRabbitService.checkStatus();
    res.json({ data: status });
  } catch (error) {
    logger.error('Error checking CodeRabbit status:', error);
    throw new CustomError('Failed to check CodeRabbit status', 500);
  }
});

// Get all PRs
router.get('/prs', async (req: Request, res: Response) => {
  try {
    const state = (req.query.state as 'open' | 'closed' | 'all') || 'open';
    const prs = await codeRabbitService.getPRs(state);
    res.json({ data: prs, count: prs.length });
  } catch (error) {
    logger.error('Error fetching PRs:', error);
    throw new CustomError('Failed to fetch PRs', 500);
  }
});

// Get specific PR
router.get('/prs/:prNumber', async (req: Request, res: Response) => {
  try {
    const prNumber = parseInt(req.params.prNumber, 10);
    if (isNaN(prNumber)) {
      throw new CustomError('Invalid PR number', 400);
    }

    const pr = await codeRabbitService.getPR(prNumber);
    res.json({ data: pr });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Error fetching PR:', error);
    throw new CustomError('Failed to fetch PR', 500);
  }
});

// Create a new PR
router.post('/prs', async (req: Request, res: Response) => {
  try {
    const { title, body, head, base, repo } = req.body;

    if (!title || !head) {
      throw new CustomError('Missing required fields: title, head', 400);
    }

    const pr = await codeRabbitService.createPR({
      title,
      body: body || '',
      head,
      base: base || 'main',
      repo: repo || '',
    });

    // Automatically trigger CodeRabbit review
    await codeRabbitService.triggerReview(pr.number);

    res.json({
      data: pr,
      message: `PR #${pr.number} created and review triggered`,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Error creating PR:', error);
    throw new CustomError('Failed to create PR', 500);
  }
});

// Trigger CodeRabbit review for a PR
router.post('/prs/:prNumber/trigger-review', async (req: Request, res: Response) => {
  try {
    const prNumber = parseInt(req.params.prNumber, 10);
    if (isNaN(prNumber)) {
      throw new CustomError('Invalid PR number', 400);
    }

    const success = await codeRabbitService.triggerReview(prNumber);

    res.json({
      data: { success },
      message: success
        ? `Review triggered for PR #${prNumber}`
        : `Failed to trigger review for PR #${prNumber}`,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Error triggering review:', error);
    throw new CustomError('Failed to trigger review', 500);
  }
});

// Fetch CodeRabbit review comments
router.get('/prs/:prNumber/comments', async (req: Request, res: Response) => {
  try {
    const prNumber = parseInt(req.params.prNumber, 10);
    if (isNaN(prNumber)) {
      throw new CustomError('Invalid PR number', 400);
    }

    const comments = await codeRabbitService.fetchReviewComments(prNumber);

    res.json({
      data: comments,
      count: comments.length,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Error fetching comments:', error);
    throw new CustomError('Failed to fetch comments', 500);
  }
});

// Apply fixes to a PR (triggers FixerAgent)
router.post('/prs/:prNumber/apply-fixes', async (req: Request, res: Response) => {
  try {
    const prNumber = parseInt(req.params.prNumber, 10);
    if (isNaN(prNumber)) {
      throw new CustomError('Invalid PR number', 400);
    }

    // Fetch comments
    const comments = await codeRabbitService.fetchReviewComments(prNumber);

    // Get FixerAgent
    const fixerAgent = agentService.getAllAgents().find((a) => a.type === 'fixer');
    if (!fixerAgent) {
      throw new CustomError('FixerAgent not found', 404);
    }

    // Execute FixerAgent with CodeRabbit comments
    const fixTask = await agentService.executeTask(fixerAgent.id, {
      type: 'fix-coderabbit-comments',
      payload: {
        prNumber,
        comments,
      },
    });

    res.json({
      data: {
        task: fixTask,
        commentsCount: comments.length,
      },
      message: 'Fix task created. FixerAgent will process the comments.',
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Error applying fixes:', error);
    throw new CustomError('Failed to apply fixes', 500);
  }
});

// Close a PR
router.post('/prs/:prNumber/close', async (req: Request, res: Response) => {
  try {
    const prNumber = parseInt(req.params.prNumber, 10);
    if (isNaN(prNumber)) {
      throw new CustomError('Invalid PR number', 400);
    }

    const success = await codeRabbitService.closePR(prNumber);

    res.json({
      data: { success },
      message: success ? `PR #${prNumber} closed` : `Failed to close PR #${prNumber}`,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    logger.error('Error closing PR:', error);
    throw new CustomError('Failed to close PR', 500);
  }
});

// Webhook endpoint for CodeRabbit events
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    logger.info(`Received GitHub webhook: ${event}`);

    // Handle different event types
    if (event === 'pull_request') {
      const action = payload.action;
      const pr = payload.pull_request;

      logger.info(`PR ${action}: #${pr.number} - ${pr.title}`);

      // If PR is opened or synchronized, trigger review
      if (action === 'opened' || action === 'synchronize') {
        await codeRabbitService.triggerReview(pr.number);
      }
    } else if (event === 'pull_request_review') {
      const review = payload.review;
      const pr = payload.pull_request;

      logger.info(`Review ${review.state} on PR #${pr.number}`);

      // If review requests changes, trigger FixerAgent
      if (review.state === 'changes_requested' || review.state === 'commented') {
        const comments = await codeRabbitService.fetchReviewComments(pr.number);
        
        // Trigger FixerAgent automatically
        const fixerAgent = agentService.getAllAgents().find((a) => a.type === 'fixer');
        if (fixerAgent) {
          await agentService.executeTask(fixerAgent.id, {
            type: 'fix-coderabbit-comments',
            payload: {
              prNumber: pr.number,
              comments,
            },
          });
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    // Don't throw error for webhooks - just log it
    res.status(200).json({ received: true, error: 'Processing failed but acknowledged' });
  }
});

export default router;

