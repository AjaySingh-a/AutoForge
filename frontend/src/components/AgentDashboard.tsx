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
      setLoading(true);
      setError(null);
      
      // Log the exact URL being called
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://auto-forge-backend.vercel.app').replace(/\/+$/, '');
      const fullUrl = `${apiUrl}/api/agents`;
      console.log('🔍 Attempting to fetch agents from:', fullUrl);
      console.log('🌐 Current window origin:', window.location.origin);
      
      // Try direct fetch first to see exact error
      try {
        const testResponse = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });
        console.log('📡 Fetch response status:', testResponse.status);
        console.log('📡 Fetch response headers:', Object.fromEntries(testResponse.headers.entries()));
        
        if (!testResponse.ok) {
          const errorText = await testResponse.text();
          console.error('❌ Fetch error response:', errorText);
          throw new Error(`HTTP ${testResponse.status}: ${errorText}`);
        }
        
        const testData = await testResponse.json();
        console.log('✅ Fetch successful, data:', testData);
        setAgents(testData.data || []);
        setError(null);
        return;
      } catch (fetchError: any) {
        console.error('❌ Direct fetch failed:', fetchError);
        console.error('❌ Error name:', fetchError.name);
        console.error('❌ Error message:', fetchError.message);
        console.error('❌ Error stack:', fetchError.stack);
      }
      
      // Fallback to axios
      const response = await apiClient.get('/api/agents');
      console.log('✅ Agents API Response:', response.data);
      setAgents(response.data.data || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch agents';
      const errorDetails = {
        message: errorMessage,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        url: err?.config?.url,
        baseURL: err?.config?.baseURL,
        errorCode: err?.code,
        errorName: err?.name,
        fullError: err
      };
      console.error('❌ Error fetching agents (full details):', errorDetails);
      console.error('❌ Error object:', err);
      
      // More detailed error message
      let userMessage = `Failed to fetch agents: ${errorMessage}`;
      if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
        userMessage += '\n\nPossible causes:\n- Backend is not accessible\n- CORS issue\n- Network connectivity problem\n\nCheck browser console for details.';
      }
      if (err?.response?.status) {
        userMessage += ` (HTTP ${err.response.status})`;
      }
      
      setError(userMessage);
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

