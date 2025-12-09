'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';

interface ClineStatus {
  available: boolean;
  version: string | null;
  authenticated: boolean;
}

interface ClineResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode?: number;
}

export const ClinePanel: React.FC = () => {
  const [status, setStatus] = useState<ClineStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState('');
  const [files, setFiles] = useState('');
  const [context, setContext] = useState('');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<ClineResult | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await apiClient.get('/api/cline/status');
      setStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching Cline status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    setExecuting(true);
    setResult(null);

    try {
      const payload: {
        task: string;
        files?: string[];
        context?: string;
      } = {
        task,
      };

      if (files.trim()) {
        payload.files = files.split(',').map((f) => f.trim());
      }

      if (context.trim()) {
        payload.context = context;
      }

      const response = await apiClient.post('/api/cline/execute', payload);
      setResult(response.data.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute task';
      setResult({
        success: false,
        output: '',
        error: errorMessage,
        exitCode: 1,
      });
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center">Loading Cline status...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Cline CLI Integration
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Infinity Build Award - AI-powered code generation
        </p>
      </div>

      {/* Status */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                status?.available ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-gray-700 dark:text-gray-300">
              {status?.available ? 'Available' : 'Not Available'}
            </span>
          </div>
          {status?.version && (
            <div className="text-gray-600 dark:text-gray-400">
              Version: {status.version}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                status?.authenticated ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            />
            <span className="text-gray-700 dark:text-gray-300">
              {status?.authenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
        </div>
        {!status?.available && (
          <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900 rounded text-sm text-yellow-800 dark:text-yellow-200">
            Install Cline CLI: <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">npm install -g cline</code>
          </div>
        )}
      </div>

      {/* Task Form */}
      <form onSubmit={handleExecute} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Task Description *
          </label>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g., Add unit tests to utils.js"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
            disabled={!status?.available || executing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Files (comma-separated, optional)
          </label>
          <input
            type="text"
            value={files}
            onChange={(e) => setFiles(e.target.value)}
            placeholder="e.g., src/utils.js, src/helpers.ts"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={!status?.available || executing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Context (optional)
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Additional context for the task"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={!status?.available || executing}
          />
        </div>

        <button
          type="submit"
          disabled={!status?.available || executing || !task.trim()}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {executing ? 'Executing...' : 'Execute with Cline'}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="mt-6 p-4 rounded-lg border">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Result
          </h3>
          <div
            className={`p-3 rounded ${
              result.success
                ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}
          >
            <div className="font-semibold mb-2">
              {result.success ? '✓ Success' : '✗ Failed'}
            </div>
            {result.output && (
              <pre className="text-sm whitespace-pre-wrap font-mono bg-white dark:bg-gray-800 p-3 rounded mt-2 overflow-x-auto">
                {result.output}
              </pre>
            )}
            {result.error && (
              <div className="text-sm mt-2 font-mono bg-white dark:bg-gray-800 p-3 rounded">
                {result.error}
              </div>
            )}
            {result.exitCode !== undefined && (
              <div className="text-xs mt-2 opacity-75">
                Exit code: {result.exitCode}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

