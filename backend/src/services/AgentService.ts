import { PlannerAgent } from '../modules/agents/PlannerAgent';
import { DeveloperAgent } from '../modules/agents/DeveloperAgent';
import { ReviewerAgent } from '../modules/agents/ReviewerAgent';
import { FixerAgent } from '../modules/agents/FixerAgent';
import { DevOpsAgent } from '../modules/agents/DevOpsAgent';
import { ClineAgent } from '../modules/agents/ClineAgent';
import { BaseAgent, AgentTask } from '../core/Agent';
import { Agent } from '../types';
import { logger } from '../utils/logger';

export class AgentService {
  private agents: Map<string, BaseAgent>;
  private taskQueue: Map<string, AgentTask>;
  private activeTasks: Map<string, Promise<AgentTask>>;

  constructor() {
    this.agents = new Map();
    this.taskQueue = new Map();
    this.activeTasks = new Map();

    // Initialize all agents
    this.initializeAgents();
  }

  private initializeAgents(): void {
    const agents = [
      new PlannerAgent(),
      new DeveloperAgent(),
      new ReviewerAgent(),
      new FixerAgent(),
      new DevOpsAgent(),
      new ClineAgent(), // Cline CLI integration for Infinity Build Award
    ];

    agents.forEach((agent) => {
      this.agents.set(agent.getId(), agent);
    });

    logger.info(`Initialized ${agents.length} agents (including Cline Agent)`);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values()).map((agent) => agent.toJSON());
  }

  getAgent(id: string): Agent | null {
    const agent = this.agents.get(id);
    return agent ? agent.toJSON() : null;
  }

  async executeTask(agentId: string, task: Omit<AgentTask, 'id' | 'status'>): Promise<AgentTask> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const fullTask: AgentTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
    };

    // Check if agent is available
    if (agent.getStatus() !== 'idle') {
      // Queue the task
      this.taskQueue.set(fullTask.id, fullTask);
      logger.info(`Task ${fullTask.id} queued for agent ${agentId}`);
      return fullTask;
    }

    // Execute immediately
    return this.executeTaskImmediate(agent, fullTask);
  }

  private async executeTaskImmediate(agent: BaseAgent, task: AgentTask): Promise<AgentTask> {
    const taskPromise = agent.execute(task);
    this.activeTasks.set(task.id, taskPromise);

    try {
      const result = await taskPromise;
      this.activeTasks.delete(task.id);
      
      // Process queued tasks
      this.processQueue(agent);
      
      return result;
    } catch (error) {
      this.activeTasks.delete(task.id);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Task execution failed: ${errorMessage}`);
      
      return {
        ...task,
        status: 'failed',
        error: errorMessage,
      };
    }
  }

  private processQueue(agent: BaseAgent): void {
    if (agent.getStatus() !== 'idle') {
      return;
    }

    // Find queued tasks for this agent
    const queuedTask = Array.from(this.taskQueue.entries()).find(([_, task]) => {
      // This is simplified - in production, you'd match by agent type/capability
      return true;
    });

    if (queuedTask) {
      const [taskId, task] = queuedTask;
      this.taskQueue.delete(taskId);
      this.executeTaskImmediate(agent, task);
    }
  }

  getTaskStatus(taskId: string): AgentTask | null {
    // Check active tasks
    const activeTask = Array.from(this.taskQueue.entries()).find(([id]) => id === taskId);
    if (activeTask) {
      return activeTask[1];
    }

    // In production, you'd query a database for task history
    return null;
  }

  getAgentStatus(agentId: string): Agent | null {
    return this.getAgent(agentId);
  }
}

// Singleton instance
let agentServiceInstance: AgentService | null = null;

export const getAgentService = (): AgentService => {
  if (!agentServiceInstance) {
    agentServiceInstance = new AgentService();
  }
  return agentServiceInstance;
};

