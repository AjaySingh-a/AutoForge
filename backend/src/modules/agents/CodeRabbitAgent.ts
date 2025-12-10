import { BaseAgent, AgentTask } from '../../core/Agent';
import { getCodeRabbitService } from '../../core/coderabbit/CodeRabbitService';
import { logger } from '../../utils/logger';
import type {
  CodeRabbitComment,
  GitHubPR,
} from '../../core/coderabbit/CodeRabbitService';

export interface CodeRabbitTask {
  action:
    | 'review-latest-commit'
    | 'fix-comments'
    | 'apply-suggestions'
    | 'close-pr'
    | 'create-pr'
    | 'fetch-comments'
    | 'trigger-review';
  prNumber?: number;
  title?: string;
  body?: string;
  head?: string;
  base?: string;
  repo?: string;
  comments?: CodeRabbitComment[];
}

export interface CodeRabbitResult {
  success: boolean;
  pr?: GitHubPR;
  comments?: CodeRabbitComment[];
  fixesApplied?: number;
  message: string;
}

/**
 * CodeRabbit Agent - Handles PR automation and CodeRabbit review integration
 * Captain Code Award requirement
 */
export class CodeRabbitAgent extends BaseAgent {
  private codeRabbitService = getCodeRabbitService();

  constructor() {
    super(
      'coderabbit-001',
      'CodeRabbit Agent',
      'reviewer', // Extends reviewer capabilities
      'GitHub PR automation and CodeRabbit review integration (Captain Code Award)',
      {
        canPlan: false,
        canDevelop: false,
        canReview: true,
        canFix: false,
        canDeploy: false,
      }
    );
  }

  async execute(task: AgentTask): Promise<AgentTask> {
    this.setStatus('active');
    logger.info(`CodeRabbit Agent executing task: ${task.id}`);

    try {
      const coderabbitTask = task.payload as CodeRabbitTask;
      const result = await this.handleTask(coderabbitTask);

      this.setStatus('idle');
      return {
        ...task,
        status: result.success ? 'completed' : 'failed',
        result,
        error: result.success ? undefined : result.message,
      };
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`CodeRabbit Agent error: ${errorMessage}`);

      return {
        ...task,
        status: 'failed',
        error: errorMessage,
      };
    }
  }

  private async handleTask(task: CodeRabbitTask): Promise<CodeRabbitResult> {
    switch (task.action) {
      case 'create-pr':
        return await this.createPR(task);

      case 'fetch-comments':
        return await this.fetchComments(task);

      case 'trigger-review':
        return await this.triggerReview(task);

      case 'review-latest-commit':
        return await this.reviewLatestCommit(task);

      case 'fix-comments':
      case 'apply-suggestions':
        return await this.applyFixes(task);

      case 'close-pr':
        return await this.closePR(task);

      default:
        throw new Error(`Unknown action: ${task.action}`);
    }
  }

  private async createPR(task: CodeRabbitTask): Promise<CodeRabbitResult> {
    if (!task.title || !task.head) {
      throw new Error('Missing required fields: title, head');
    }

    const pr = await this.codeRabbitService.createPR({
      title: task.title,
      body: task.body || '',
      head: task.head,
      base: task.base || 'main',
      repo: task.repo || '',
    });

    // Trigger CodeRabbit review automatically
    await this.codeRabbitService.triggerReview(pr.number);

    return {
      success: true,
      pr,
      message: `PR #${pr.number} created and review triggered`,
    };
  }

  private async fetchComments(task: CodeRabbitTask): Promise<CodeRabbitResult> {
    if (!task.prNumber) {
      throw new Error('Missing required field: prNumber');
    }

    const comments = await this.codeRabbitService.fetchReviewComments(task.prNumber);

    return {
      success: true,
      comments,
      message: `Fetched ${comments.length} CodeRabbit comments`,
    };
  }

  private async triggerReview(task: CodeRabbitTask): Promise<CodeRabbitResult> {
    if (!task.prNumber) {
      throw new Error('Missing required field: prNumber');
    }

    const success = await this.codeRabbitService.triggerReview(task.prNumber);

    return {
      success,
      message: success
        ? `Review triggered for PR #${task.prNumber}`
        : `Failed to trigger review for PR #${task.prNumber}`,
    };
  }

  private async reviewLatestCommit(_task: CodeRabbitTask): Promise<CodeRabbitResult> {
    // Get latest PR or create one from current branch
    const prs = await this.codeRabbitService.getPRs('open');
    
    if (prs.length === 0) {
      return {
        success: false,
        message: 'No open PRs found',
      };
    }

    const latestPR = prs[0];
    const comments = await this.codeRabbitService.fetchReviewComments(latestPR.number);

    return {
      success: true,
      pr: latestPR,
      comments,
      message: `Fetched review for latest PR #${latestPR.number}`,
    };
  }

  private async applyFixes(task: CodeRabbitTask): Promise<CodeRabbitResult> {
    if (!task.prNumber) {
      throw new Error('Missing required field: prNumber');
    }

    // Fetch comments if not provided
    let comments = task.comments;
    if (!comments || comments.length === 0) {
      comments = await this.codeRabbitService.fetchReviewComments(task.prNumber);
    }

    if (!comments || comments.length === 0) {
      return {
        success: false,
        message: 'No comments to fix',
      };
    }

    // Filter comments with suggestions
    const commentsWithSuggestions = comments.filter((c) => c.suggestion);

    if (commentsWithSuggestions.length === 0) {
      return {
        success: true,
        comments,
        fixesApplied: 0,
        message: 'No suggestions found in comments',
      };
    }

    // In a real implementation, this would:
    // 1. Parse suggestions from comments
    // 2. Use FixerAgent to generate fixes
    // 3. Create commits with fixes
    // 4. Post commits to PR

    // For now, return the comments that need fixing
    return {
      success: true,
      comments: commentsWithSuggestions,
      fixesApplied: 0, // Would be set after actual fixes are applied
      message: `Found ${commentsWithSuggestions.length} comments with suggestions`,
    };
  }

  private async closePR(task: CodeRabbitTask): Promise<CodeRabbitResult> {
    if (!task.prNumber) {
      throw new Error('Missing required field: prNumber');
    }

    const success = await this.codeRabbitService.closePR(task.prNumber);

    return {
      success,
      message: success
        ? `PR #${task.prNumber} closed`
        : `Failed to close PR #${task.prNumber}`,
    };
  }
}

