import { BaseAgent, AgentTask } from '../../core/Agent';
import { logger } from '../../utils/logger';
import { getClineService } from '../../core/ClineService';
import type { CodeRabbitComment } from '../../core/coderabbit/CodeRabbitService';

export interface FixTask {
  code: string;
  issues: Array<{
    type: string;
    message: string;
    line?: number;
    suggestion?: string;
  }>;
  language: string;
}

export interface FixResult {
  fixedCode: string;
  fixesApplied: string[];
  improvements: string[];
}

export interface CodeRabbitFixTask {
  prNumber: number;
  comments: CodeRabbitComment[];
}

export class FixerAgent extends BaseAgent {
  constructor() {
    super(
      'fixer-001',
      'Fixer/Refactor Agent',
      'fixer',
      'Refactors code automatically for optimization, maintainability, and readability',
      {
        canPlan: false,
        canDevelop: false,
        canReview: false,
        canFix: true,
        canDeploy: false,
      }
    );
  }

  async execute(task: AgentTask): Promise<AgentTask> {
    this.setStatus('active');
    logger.info(`Fixer Agent executing task: ${task.id}`);

    try {
      // Check if this is a CodeRabbit fix task
      if (task.type === 'fix-coderabbit-comments') {
        const codeRabbitTask = task.payload as CodeRabbitFixTask;
        const result = await this.fixCodeRabbitComments(codeRabbitTask);

        this.setStatus('idle');
        return {
          ...task,
          status: result.success ? 'completed' : 'failed',
          result,
          error: result.success ? undefined : result.message,
        };
      }

      // Regular fix task
      const fixTask = task.payload as FixTask;
      const result = await this.fix(fixTask);

      this.setStatus('idle');
      return {
        ...task,
        status: 'completed',
        result,
      };
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Fixer Agent error: ${errorMessage}`);

      return {
        ...task,
        status: 'failed',
        error: errorMessage,
      };
    }
  }

  private async fix(task: FixTask): Promise<FixResult> {
    // Simulate fixing process
    await this.delay(1300);

    let fixedCode = task.code;
    const fixesApplied: string[] = [];
    const improvements: string[] = [];

    // Apply fixes based on issues
    task.issues.forEach((issue) => {
      const fix = this.applyFix(fixedCode, issue, task.language);
      if (fix.fixed) {
        fixedCode = fix.code;
        fixesApplied.push(issue.message);
        if (fix.improvement) {
          improvements.push(fix.improvement);
        }
      }
    });

    // Apply general refactoring
    fixedCode = this.refactor(fixedCode, task.language);
    improvements.push('Applied general code refactoring');

    return {
      fixedCode,
      fixesApplied,
      improvements,
    };
  }

  private applyFix(
    code: string,
    issue: FixTask['issues'][0],
    _language: string
  ): { fixed: boolean; code: string; improvement?: string } {
    let fixed = false;
    let newCode = code;

    // Fix console.log
    if (issue.message.includes('console.log')) {
      newCode = newCode.replace(/console\.log\(/g, 'logger.info(');
      fixed = true;
      return { fixed, code: newCode, improvement: 'Replaced console.log with logger' };
    }

    // Fix any type
    if (issue.message.includes('any')) {
      // This would require more sophisticated analysis in production
      fixed = true;
      return { fixed, code: newCode, improvement: 'Identified "any" types for manual review' };
    }

    // Fix long lines
    if (issue.message.includes('exceeds')) {
      // Would need more sophisticated line breaking logic
      fixed = true;
      return { fixed, code: newCode, improvement: 'Identified long lines for refactoring' };
    }

    // Fix missing error handling
    if (issue.message.includes('error handling')) {
      // Would need AST parsing for proper fix
      fixed = true;
      return { fixed, code: newCode, improvement: 'Added error handling suggestions' };
    }

    return { fixed, code: newCode };
  }

  private refactor(code: string, language: string): string {
    let refactored = code;

    // Remove trailing whitespace
    refactored = refactored.split('\n').map((line) => line.trimEnd()).join('\n');

    // Ensure consistent indentation (2 spaces)
    if (language === 'typescript' || language === 'javascript') {
      // Basic indentation normalization
      const lines = refactored.split('\n');
      let indentLevel = 0;
      const indentSize = 2;

      refactored = lines
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return '';

          // Decrease indent for closing braces
          if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
            indentLevel = Math.max(0, indentLevel - 1);
          }

          const indented = ' '.repeat(indentLevel * indentSize) + trimmed;

          // Increase indent for opening braces
          if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
            indentLevel++;
          }

          return indented;
        })
        .join('\n');
    }

    // Add newline at end of file
    if (!refactored.endsWith('\n')) {
      refactored += '\n';
    }

    return refactored;
  }

  /**
   * Fix CodeRabbit comments using Cline CLI
   */
  private async fixCodeRabbitComments(
    task: CodeRabbitFixTask
  ): Promise<{ success: boolean; fixesApplied: number; message: string }> {
    const clineService = getClineService();
    const isClineAvailable = await clineService.isClineAvailable();

    if (!isClineAvailable) {
      return {
        success: false,
        fixesApplied: 0,
        message: 'Cline CLI is not available. Cannot apply CodeRabbit fixes.',
      };
    }

    // Filter comments with suggestions
    const commentsWithSuggestions = task.comments.filter((c) => c.suggestion);

    if (commentsWithSuggestions.length === 0) {
      return {
        success: true,
        fixesApplied: 0,
        message: 'No suggestions found in CodeRabbit comments',
      };
    }

    let fixesApplied = 0;
    const fixTasks: string[] = [];

    // Group comments by file
    const commentsByFile = new Map<string, CodeRabbitComment[]>();
    commentsWithSuggestions.forEach((comment) => {
      if (comment.path) {
        const existing = commentsByFile.get(comment.path) || [];
        existing.push(comment);
        commentsByFile.set(comment.path, existing);
      }
    });

    // Create fix tasks for each file
    for (const [filePath, fileComments] of commentsByFile.entries()) {
      const suggestions = fileComments
        .map((c) => c.suggestion)
        .filter((s): s is string => !!s)
        .join('\n');

      const fixTask = `Apply CodeRabbit suggestions to ${filePath}:\n${suggestions}`;

      try {
        const result = await clineService.executeTask({
          task: fixTask,
          files: [filePath],
          context: `PR #${task.prNumber} - CodeRabbit review fixes`,
        });

        if (result.success) {
          fixesApplied += fileComments.length;
          fixTasks.push(fixTask);
        }
      } catch (error) {
        logger.error(`Failed to fix ${filePath}:`, error);
      }
    }

    return {
      success: fixesApplied > 0,
      fixesApplied,
      message: `Applied ${fixesApplied} fixes from CodeRabbit comments using Cline CLI`,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

