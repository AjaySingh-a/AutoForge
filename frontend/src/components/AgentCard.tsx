'use client';

import React from 'react';
import { Agent } from '@/types';

interface AgentCardProps {
  agent: Agent;
  onExecute?: (agentId: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onExecute }) => {
  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-green-500';
    }
  };

  const getTypeIcon = (type: Agent['type']) => {
    switch (type) {
      case 'planner':
        return '📋';
      case 'developer':
        return '💻';
      case 'reviewer':
        return '🔍';
      case 'fixer':
        return '🔧';
      case 'devops':
        return '🚀';
      default:
        return '🤖';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getTypeIcon(agent.type)}</span>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {agent.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {agent.type} Agent
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}
            title={agent.status}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {agent.status}
          </span>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
        {agent.description}
      </p>

      {onExecute && (
        <button
          onClick={() => onExecute(agent.id)}
          disabled={agent.status === 'active'}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {agent.status === 'active' ? 'Working...' : 'Execute Task'}
        </button>
      )}
    </div>
  );
};

