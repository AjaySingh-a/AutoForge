'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../utils/api';

interface GitHubPR {
  number: number;
  title: string;
  body: string;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
  };
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
}

interface CodeRabbitComment {
  id: string;
  path: string;
  line: number;
  body: string;
  side: 'LEFT' | 'RIGHT';
  start_line?: number;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  suggestion?: string;
  severity?: 'info' | 'warning' | 'error';
}

interface Status {
  github: boolean;
  coderabbit: boolean;
  message: string;
}

export const CodeRabbitPanel: React.FC = () => {
  const [status, setStatus] = useState<Status | null>(null);
  const [prs, setPRs] = useState<GitHubPR[]>([]);
  const [selectedPR, setSelectedPR] = useState<number | null>(null);
  const [comments, setComments] = useState<CodeRabbitComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingComments, setFetchingComments] = useState(false);
  const [applyingFixes, setApplyingFixes] = useState(false);
  const [creatingPR, setCreatingPR] = useState(false);

  // PR creation form
  const [prTitle, setPRTitle] = useState('');
  const [prBody, setPRBody] = useState('');
  const [prHead, setPRHead] = useState('');
  const [prBase, setPRBase] = useState('main');

  useEffect(() => {
    fetchStatus();
    fetchPRs();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await apiClient.get('/api/coderabbit/status');
      setStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPRs = async () => {
    try {
      const response = await apiClient.get('/api/coderabbit/prs?state=open');
      setPRs(response.data.data || []);
    } catch (error) {
      console.error('Error fetching PRs:', error);
    }
  };

  const fetchComments = async (prNumber: number) => {
    setFetchingComments(true);
    try {
      const response = await apiClient.get(`/api/coderabbit/prs/${prNumber}/comments`);
      setComments(response.data.data || []);
      setSelectedPR(prNumber);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setFetchingComments(false);
    }
  };

  const triggerReview = async (prNumber: number) => {
    try {
      await apiClient.post(`/api/coderabbit/prs/${prNumber}/trigger-review`);
      alert('Review triggered successfully!');
    } catch (error) {
      console.error('Error triggering review:', error);
      alert('Failed to trigger review');
    }
  };

  const applyFixes = async (prNumber: number) => {
    setApplyingFixes(true);
    try {
      const response = await apiClient.post(`/api/coderabbit/prs/${prNumber}/apply-fixes`);
      alert(`Fixes applied! ${response.data.message}`);
      // Refresh comments
      await fetchComments(prNumber);
    } catch (error) {
      console.error('Error applying fixes:', error);
      alert('Failed to apply fixes');
    } finally {
      setApplyingFixes(false);
    }
  };

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPR(true);
    try {
      const response = await apiClient.post('/api/coderabbit/prs', {
        title: prTitle,
        body: prBody,
        head: prHead,
        base: prBase,
      });
      alert(`PR created: #${response.data.data.number}`);
      setPRTitle('');
      setPRBody('');
      setPRHead('');
      setPRBase('main');
      await fetchPRs();
    } catch (error) {
      console.error('Error creating PR:', error);
      alert('Failed to create PR');
    } finally {
      setCreatingPR(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          CodeRabbit Integration
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Captain Code Award - GitHub PR automation
        </p>

        {status && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    status.github ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-gray-700 dark:text-gray-300">
                  GitHub: {status.github ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    status.coderabbit ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-gray-700 dark:text-gray-300">
                  CodeRabbit: {status.coderabbit ? 'Available' : 'Not Available'}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
                {status.message}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create PR Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Create Pull Request
        </h3>
        <form onSubmit={handleCreatePR} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={prTitle}
              onChange={(e) => setPRTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Body
            </label>
            <textarea
              value={prBody}
              onChange={(e) => setPRBody(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Head Branch *
              </label>
              <input
                type="text"
                value={prHead}
                onChange={(e) => setPRHead(e.target.value)}
                placeholder="feature/my-feature"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base Branch
              </label>
              <input
                type="text"
                value={prBase}
                onChange={(e) => setPRBase(e.target.value)}
                placeholder="main"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={creatingPR}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {creatingPR ? 'Creating...' : 'Create PR'}
          </button>
        </form>
      </div>

      {/* PR List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Pull Requests
          </h3>
          <button
            onClick={fetchPRs}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Refresh
          </button>
        </div>

        {prs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No open PRs found</p>
        ) : (
          <div className="space-y-4">
            {prs.map((pr) => (
              <div
                key={pr.number}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <a
                      href={pr.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-primary-600 hover:text-primary-700"
                    >
                      #{pr.number} - {pr.title}
                    </a>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {pr.head.ref} → {pr.base.ref}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      pr.state === 'open'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {pr.state}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => fetchComments(pr.number)}
                    disabled={fetchingComments && selectedPR === pr.number}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {fetchingComments && selectedPR === pr.number
                      ? 'Loading...'
                      : 'Fetch Comments'}
                  </button>
                  <button
                    onClick={() => triggerReview(pr.number)}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                  >
                    Trigger Review
                  </button>
                  <button
                    onClick={() => applyFixes(pr.number)}
                    disabled={applyingFixes}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {applyingFixes ? 'Applying...' : 'Apply Fixes'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments */}
      {selectedPR && comments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            CodeRabbit Comments (PR #{selectedPR})
          </h3>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-lg border ${getSeverityColor(comment.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={comment.user.avatar_url}
                      alt={comment.user.login}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-semibold">{comment.user.login}</span>
                  </div>
                  {comment.severity && (
                    <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded">
                      {comment.severity}
                    </span>
                  )}
                </div>
                {comment.path && (
                  <p className="text-sm font-mono mb-2">
                    {comment.path}:{comment.line}
                  </p>
                )}
                <p className="mb-2 whitespace-pre-wrap">{comment.body}</p>
                {comment.suggestion && (
                  <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded">
                    <p className="text-xs font-semibold mb-1">Suggestion:</p>
                    <pre className="text-xs whitespace-pre-wrap">{comment.suggestion}</pre>
                  </div>
                )}
                <p className="text-xs opacity-75 mt-2">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

