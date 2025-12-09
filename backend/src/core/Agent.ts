import { Agent as AgentType } from '../types';

export interface AgentTask {
  id: string;
  type: string;
  payload: unknown;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
}

export interface AgentCapabilities {
  canPlan: boolean;
  canDevelop: boolean;
  canReview: boolean;
  canFix: boolean;
  canDeploy: boolean;
}

export abstract class BaseAgent {
  protected id: string;
  protected name: string;
  protected type: AgentType['type'];
  protected status: AgentType['status'];
  protected description: string;
  protected capabilities: AgentCapabilities;

  constructor(
    id: string,
    name: string,
    type: AgentType['type'],
    description: string,
    capabilities: AgentCapabilities
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.status = 'idle';
    this.description = description;
    this.capabilities = capabilities;
  }

  abstract execute(task: AgentTask): Promise<AgentTask>;

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getType(): AgentType['type'] {
    return this.type;
  }

  getStatus(): AgentType['status'] {
    return this.status;
  }

  getDescription(): string {
    return this.description;
  }

  getCapabilities(): AgentCapabilities {
    return this.capabilities;
  }

  protected setStatus(status: AgentType['status']): void {
    this.status = status;
  }

  toJSON(): AgentType {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      description: this.description,
    };
  }
}

