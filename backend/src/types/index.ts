// Common types for the AutoForge backend

export interface Agent {
  id: string;
  name: string;
  type: 'planner' | 'developer' | 'reviewer' | 'fixer' | 'devops';
  status: 'idle' | 'active' | 'error';
  description: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  agentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

