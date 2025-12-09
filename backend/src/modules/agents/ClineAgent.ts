import { BaseAgent, AgentTask } from '../../core/Agent';
import { getClineService } from '../../core/ClineService';
import { logger } from '../../utils/logger';

export interface ClineTask {
  task: string;
  files?: string[];
  context?: string;
  workingDirectory?: string;
}

export interface ClineResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode?: number;
}

/**
 * Cline Agent - Integrates Cline CLI with the AutoForge agent system
 * This agent uses Cline CLI for AI-powered code generation and assistance
 */
export class ClineAgent extends BaseAgent {
  private clineService = getClineService();

  constructor() {
    super(
      'cline-001',
      'Cline Agent',
      'developer', // Extends developer capabilities
      'AI-powered code generation and assistance using Cline CLI (Infinity Build Award)',
      {
        canPlan: false,
        canDevelop: true,
        canReview: false,
        canFix: false,
        canDeploy: false,
      }
    );
  }

  async execute(task: AgentTask): Promise<AgentTask> {
    this.setStatus('active');
    logger.info(`Cline Agent executing task: ${task.id}`);

    try {
      // Check if Cline is available
      const isAvailable = await this.clineService.isClineAvailable();
      if (!isAvailable) {
        throw new Error(
          'Cline CLI is not installed. Please install it with: npm install -g cline'
        );
      }

      const clineTask = task.payload as ClineTask;
      const result = await this.clineService.executeTask(
        {
          task: clineTask.task,
          files: clineTask.files,
          context: clineTask.context,
        },
        clineTask.workingDirectory
      );

      this.setStatus('idle');
      return {
        ...task,
        status: result.success ? 'completed' : 'failed',
        result,
        error: result.error,
      };
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Cline Agent error: ${errorMessage}`);

      return {
        ...task,
        status: 'failed',
        error: errorMessage,
      };
    }
  }

  /**
   * Execute a task with streaming output (for real-time updates)
   */
  async executeWithStreaming(
    task: ClineTask,
    onOutput?: (data: string) => void,
    onError?: (data: string) => void
  ): Promise<ClineResult> {
    this.setStatus('active');
    logger.info('Cline Agent executing task with streaming');

    try {
      const isAvailable = await this.clineService.isClineAvailable();
      if (!isAvailable) {
        throw new Error(
          'Cline CLI is not installed. Please install it with: npm install -g cline'
        );
      }

      const result = await this.clineService.executeInteractive(
        task,
        onOutput,
        onError,
        task.workingDirectory
      );

      this.setStatus('idle');
      return result;
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Cline Agent streaming error: ${errorMessage}`);

      return {
        success: false,
        output: '',
        error: errorMessage,
        exitCode: 1,
      };
    }
  }
}

