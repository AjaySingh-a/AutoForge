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
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setShowResult(false);

    try {
      let parsedPayload: unknown;
      try {
        parsedPayload = JSON.parse(payload);
      } catch {
        // If not valid JSON, treat as string
        parsedPayload = payload;
      }

      const response = await apiClient.post(`/api/agents/${agent.id}/execute`, {
        type: taskType,
        payload: parsedPayload,
      });

      // Store the result
      setResult(response.data);
      setShowResult(true);
      
      // Log to console for debugging
      console.log('✅ Task executed successfully:', response.data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to execute task';
      setError(errorMessage);
      console.error('❌ Task execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setShowResult(false);
    setTaskType('');
    setPayload('');
    setError(null);
    onSuccess(); // Refresh agents list
    onClose();
  };

  const handleNewTask = () => {
    setResult(null);
    setShowResult(false);
    setTaskType('');
    setPayload('');
    setError(null);
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
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {showResult && result ? (
          // Show result view
          <div className="space-y-4">
            <div className="bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 px-4 py-3 rounded">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <span className="font-semibold">Task Executed Successfully!</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Result:
              </h3>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>

            {result.data?.result?.roadmap && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Roadmap Steps:
                </h3>
                <div className="space-y-2">
                  {result.data.result.roadmap.map((step: any, index: number) => (
                    <div
                      key={step.id || index}
                      className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          Step {step.order || index + 1}:
                        </span>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {step.title}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {step.description}
                          </div>
                          {step.dependencies && step.dependencies.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Dependencies: {step.dependencies.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.data?.result?.estimatedTime && (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Estimated Time:
                </span>{' '}
                <span className="text-gray-700 dark:text-gray-300">
                  {result.data.result.estimatedTime}
                </span>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleNewTask}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Execute Another Task
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          // Show form view
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
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

