import { BaseAgent, AgentTask } from '../../core/Agent';
import { logger } from '../../utils/logger';

export interface ReviewTask {
  code: string;
  language: string;
  context?: string;
  rules?: string[];
}

export interface ReviewResult {
  issues: CodeIssue[];
  score: number;
  suggestions: string[];
  passed: boolean;
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  severity: 'high' | 'medium' | 'low';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export class ReviewerAgent extends BaseAgent {
  constructor() {
    super(
      'reviewer-001',
      'Reviewer Agent',
      'reviewer',
      'Reviews code for bugs, logical errors, performance issues, and architecture inconsistencies',
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
    logger.info(`Reviewer Agent executing task: ${task.id}`);

    try {
      const reviewTask = task.payload as ReviewTask;
      const result = await this.review(reviewTask);

      this.setStatus('idle');
      return {
        ...task,
        status: 'completed',
        result,
      };
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Reviewer Agent error: ${errorMessage}`);
      
      return {
        ...task,
        status: 'failed',
        error: errorMessage,
      };
    }
  }

  private async review(task: ReviewTask): Promise<ReviewResult> {
    // Simulate review process
    await this.delay(1200);

    const issues = this.analyzeCode(task.code, task.language);
    const score = this.calculateScore(issues);
    const suggestions = this.generateSuggestions(issues);
    const passed = score >= 70; // Pass threshold

    return {
      issues,
      score,
      suggestions,
      passed,
    };
  }

  private analyzeCode(code: string, language: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = code.split('\n');

    // Basic code analysis
    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Check for TODO/FIXME comments
      if (line.includes('TODO') || line.includes('FIXME')) {
        issues.push({
          type: 'warning',
          severity: 'low',
          message: 'TODO/FIXME comment found',
          line: lineNum,
          suggestion: 'Address the TODO/FIXME before merging',
        });
      }

      // Check for console.log (should use logger in production)
      if (line.includes('console.log') && !line.includes('//')) {
        issues.push({
          type: 'warning',
          severity: 'medium',
          message: 'console.log found - use logger instead',
          line: lineNum,
          suggestion: 'Replace with logger.info() or logger.debug()',
        });
      }

      // Check for long lines
      if (line.length > 120) {
        issues.push({
          type: 'info',
          severity: 'low',
          message: 'Line exceeds 120 characters',
          line: lineNum,
          suggestion: 'Consider breaking into multiple lines',
        });
      }

      // Check for error handling
      if (language === 'typescript' && line.includes('async') && !code.includes('try') && !code.includes('catch')) {
        issues.push({
          type: 'warning',
          severity: 'medium',
          message: 'Async function without error handling',
          line: lineNum,
          suggestion: 'Add try-catch block for error handling',
        });
      }
    });

    // Check for type safety (TypeScript)
    if (language === 'typescript') {
      if (code.includes('any')) {
        issues.push({
          type: 'warning',
          severity: 'high',
          message: 'Usage of "any" type detected',
          suggestion: 'Use specific types instead of "any"',
        });
      }

      if (!code.includes('interface') && !code.includes('type') && code.length > 100) {
        issues.push({
          type: 'info',
          severity: 'low',
          message: 'Consider adding type definitions',
          suggestion: 'Define interfaces or types for better type safety',
        });
      }
    }

    // Check for security issues
    if (code.includes('eval(') || code.includes('Function(')) {
      issues.push({
        type: 'error',
        severity: 'high',
        message: 'Potential security risk: eval() or Function() usage',
        suggestion: 'Avoid using eval() or Function() - use safer alternatives',
      });
    }

    return issues;
  }

  private calculateScore(issues: CodeIssue[]): number {
    let score = 100;

    issues.forEach((issue) => {
      if (issue.type === 'error') {
        score -= issue.severity === 'high' ? 20 : issue.severity === 'medium' ? 10 : 5;
      } else if (issue.type === 'warning') {
        score -= issue.severity === 'high' ? 10 : issue.severity === 'medium' ? 5 : 2;
      } else {
        score -= issue.severity === 'high' ? 5 : issue.severity === 'medium' ? 2 : 1;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  private generateSuggestions(issues: CodeIssue[]): string[] {
    const suggestions = new Set<string>();

    issues.forEach((issue) => {
      if (issue.suggestion) {
        suggestions.add(issue.suggestion);
      }
    });

    // Add general suggestions
    if (issues.length > 0) {
      suggestions.add('Review all issues and address them before merging');
      suggestions.add('Consider adding unit tests for the code');
    } else {
      suggestions.add('Code looks good! Consider adding documentation');
    }

    return Array.from(suggestions);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

