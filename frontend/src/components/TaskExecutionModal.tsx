'use client';

import React, { useState } from 'react';
import { Agent } from '../types';
import { apiClient } from '../utils/api';

interface TaskExecutionModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskExecutionModal: React.FC<TaskExecutionModalProps> = ({
  agent,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [taskType, setTaskType] = useState('');
  const [payload, setPayload] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let parsedPayload: unknown;
      try {
        parsedPayload = JSON.parse(payload);
      } catch {
        // If not valid JSON, treat as string
        parsedPayload = payload;
      }

      await apiClient.post(`/api/agents/${agent.id}/execute`, {
        type: taskType,
        payload: parsedPayload,
      });

      onSuccess();
      onClose();
      // Reset form
      setTaskType('');
      setPayload('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute task';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPayload = (agentType: Agent['type']) => {
    switch (agentType) {
      case 'planner':
        return JSON.stringify({ objective: 'Build a new feature', context: 'Add context here' }, null, 2);
      case 'developer':
        return JSON.stringify({ requirement: 'Create an API endpoint', language: 'typescript' }, null, 2);
      case 'reviewer':
        return JSON.stringify({ code: '// Your code here', language: 'typescript' }, null, 2);
      case 'fixer':
        return JSON.stringify({ code: '// Your code here', issues: [], language: 'typescript' }, null, 2);
      case 'devops':
        return JSON.stringify({ action: 'deploy', target: 'frontend', environment: 'production' }, null, 2);
      default:
        return '';
    }
  };

  const handleLoadDefault = () => {
    setPayload(getDefaultPayload(agent.type));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Execute Task - {agent.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Type
            </label>
            <input
              type="text"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              placeholder="e.g., plan, develop, review"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payload (JSON)
              </label>
              <button
                type="button"
                onClick={handleLoadDefault}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Load Default
              </button>
            </div>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder="Enter task payload as JSON"
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Executing...' : 'Execute Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

