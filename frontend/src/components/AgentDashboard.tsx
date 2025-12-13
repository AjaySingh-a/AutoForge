'use client';

import React, { useEffect, useState } from 'react';
import { Agent } from '../types';
import { AgentCard } from './AgentCard';
import { TaskExecutionModal } from './TaskExecutionModal';
import { apiClient } from '../utils/api';

export const AgentDashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAgents();
    // Poll for agent status updates every 5 seconds
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await apiClient.get('/api/agents');
      setAgents(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch agents');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (agent) {
      setSelectedAgent(agent);
      setIsModalOpen(true);
    }
  };

  const handleTaskSuccess = () => {
    fetchAgents();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading agents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Agent Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and control your AI agents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onExecute={handleExecute}
            />
          ))}
        </div>

        {agents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No agents available
            </p>
          </div>
        )}

        {selectedAgent && (
          <TaskExecutionModal
            agent={selectedAgent}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedAgent(null);
            }}
            onSuccess={handleTaskSuccess}
          />
        )}
      </div>
    </div>
  );
};

