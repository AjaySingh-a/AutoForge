import { BaseAgent, AgentTask } from '../../core/Agent';
import { logger } from '../../utils/logger';

export interface PlanningTask {
  objective: string;
  context?: string;
  constraints?: string[];
}

export interface PlanningResult {
  roadmap: RoadmapStep[];
  estimatedTime?: string;
  dependencies?: string[];
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  order: number;
  dependencies: string[];
  estimatedDuration?: string;
}

export class PlannerAgent extends BaseAgent {
  constructor() {
    super(
      'planner-001',
      'Planner Agent',
      'planner',
      'Analyzes tasks and generates step-by-step roadmaps with clear dependencies',
      {
        canPlan: true,
        canDevelop: false,
        canReview: false,
        canFix: false,
        canDeploy: false,
      }
    );
  }

  async execute(task: AgentTask): Promise<AgentTask> {
    this.setStatus('active');
    logger.info(`Planner Agent executing task: ${task.id}`);

    try {
      const planningTask = task.payload as PlanningTask;
      const result = await this.plan(planningTask);

      this.setStatus('idle');
      return {
        ...task,
        status: 'completed',
        result,
      };
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Planner Agent error: ${errorMessage}`);
      
      return {
        ...task,
        status: 'failed',
        error: errorMessage,
      };
    }
  }

  private async plan(task: PlanningTask): Promise<PlanningResult> {
    // Simulate planning process
    await this.delay(1000);

    // Analyze the objective and break it down
    const roadmap = this.breakDownTask(task.objective, task.context);

    // Identify dependencies
    const dependencies = this.identifyDependencies(roadmap);

    // Estimate time
    const estimatedTime = this.estimateTime(roadmap);

    return {
      roadmap,
      estimatedTime,
      dependencies,
    };
  }

  private breakDownTask(objective: string, _context?: string): RoadmapStep[] {
    // This is a simplified planner - in production, this would use AI/LLM
    const steps: RoadmapStep[] = [];
    const keywords = objective.toLowerCase();

    // Analyze keywords to determine steps
    if (keywords.includes('api') || keywords.includes('endpoint')) {
      steps.push({
        id: 'step-1',
        title: 'Design API Structure',
        description: 'Define endpoints, request/response schemas, and authentication',
        order: 1,
        dependencies: [],
      });
    }

    if (keywords.includes('database') || keywords.includes('db') || keywords.includes('model')) {
      steps.push({
        id: 'step-2',
        title: 'Design Database Schema',
        description: 'Create database models and relationships',
        order: 2,
        dependencies: ['step-1'],
      });
    }

    if (keywords.includes('frontend') || keywords.includes('ui') || keywords.includes('component')) {
      steps.push({
        id: 'step-3',
        title: 'Build Frontend Components',
        description: 'Create React components and pages',
        order: 3,
        dependencies: ['step-1'],
      });
    }

    if (keywords.includes('test') || keywords.includes('testing')) {
      steps.push({
        id: 'step-4',
        title: 'Write Tests',
        description: 'Create unit and integration tests',
        order: 4,
        dependencies: ['step-1', 'step-2', 'step-3'],
      });
    }

    if (keywords.includes('deploy') || keywords.includes('production')) {
      steps.push({
        id: 'step-5',
        title: 'Deploy to Production',
        description: 'Configure deployment pipeline and deploy',
        order: 5,
        dependencies: ['step-4'],
      });
    }

    // Default steps if no specific keywords found
    if (steps.length === 0) {
      steps.push(
        {
          id: 'step-1',
          title: 'Analyze Requirements',
          description: 'Understand the task requirements and constraints',
          order: 1,
          dependencies: [],
        },
        {
          id: 'step-2',
          title: 'Implement Solution',
          description: 'Build the solution according to requirements',
          order: 2,
          dependencies: ['step-1'],
        },
        {
          id: 'step-3',
          title: 'Test and Validate',
          description: 'Test the implementation and validate functionality',
          order: 3,
          dependencies: ['step-2'],
        }
      );
    }

    return steps;
  }

  private identifyDependencies(roadmap: RoadmapStep[]): string[] {
    const deps = new Set<string>();
    roadmap.forEach((step) => {
      step.dependencies.forEach((dep) => deps.add(dep));
    });
    return Array.from(deps);
  }

  private estimateTime(roadmap: RoadmapStep[]): string {
    const baseTimePerStep = 30; // minutes
    const totalMinutes = roadmap.length * baseTimePerStep;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

