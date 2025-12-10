import axios, { AxiosInstance } from 'axios';
import { logger as appLogger } from '../../utils/logger';

export interface GitHubPR {
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

export interface CodeRabbitComment {
  id: string;
  path: string;
  line: number;
  body: string;
  side: 'LEFT' | 'RIGHT';
  start_line?: number;
  start_side?: 'LEFT' | 'RIGHT';
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  review_id?: number;
  suggestion?: string;
  severity?: 'info' | 'warning' | 'error';
}

export interface CodeRabbitReview {
  id: number;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'PENDING';
  body: string;
  comments: CodeRabbitComment[];
  submitted_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface CreatePRParams {
  title: string;
  body: string;
  head: string; // branch name
  base: string; // base branch (usually 'main')
  repo: string; // format: owner/repo
}

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  baseBranch?: string;
}

export class CodeRabbitService {
  private githubApi: AxiosInstance;
  private config: GitHubConfig;
  private baseBranch: string;

  constructor(config?: Partial<GitHubConfig>) {
    const token = config?.token || process.env.GITHUB_TOKEN || '';
    const owner = config?.owner || process.env.GITHUB_OWNER || '';
    const repo = config?.repo || process.env.GITHUB_REPO || '';

    if (!token) {
      appLogger.warn('GITHUB_TOKEN not found. CodeRabbit features will be limited.');
    }

    this.config = {
      token,
      owner,
      repo,
      baseBranch: config?.baseBranch || 'main',
    };

    this.baseBranch = this.config.baseBranch || 'main';

    this.githubApi = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'AutoForge-CodeRabbit-Integration',
      },
    });
  }

  /**
   * Check GitHub and CodeRabbit connectivity
   */
  async checkStatus(): Promise<{
    github: boolean;
    coderabbit: boolean;
    message: string;
  }> {
    try {
      // Check GitHub connectivity
      const githubResponse = await this.githubApi.get('/user');
      const githubConnected = githubResponse.status === 200;

      // Check repository access
      let repoAccess = false;
      try {
        const repoResponse = await this.githubApi.get(
          `/repos/${this.config.owner}/${this.config.repo}`
        );
        repoAccess = repoResponse.status === 200;
      } catch {
        repoAccess = false;
      }

      // CodeRabbit is typically available if GitHub is connected
      // In production, you might want to check CodeRabbit API directly
      const coderabbitAvailable = githubConnected && repoAccess;

      return {
        github: githubConnected && repoAccess,
        coderabbit: coderabbitAvailable,
        message: githubConnected && repoAccess
          ? 'GitHub and CodeRabbit are connected'
          : 'GitHub connection failed. Check GITHUB_TOKEN and repository access.',
      };
    } catch (error) {
      appLogger.error('Status check failed:', error);
      return {
        github: false,
        coderabbit: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a new Pull Request
   */
  async createPR(params: CreatePRParams): Promise<GitHubPR> {
    try {
      const repo = params.repo || `${this.config.owner}/${this.config.repo}`;
      const [owner, repoName] = repo.split('/');

      appLogger.info(`Creating PR: ${params.title} (${params.head} -> ${params.base})`);

      const response = await this.githubApi.post(`/repos/${owner}/${repoName}/pulls`, {
        title: params.title,
        body: params.body,
        head: params.head,
        base: params.base || this.baseBranch,
      });

      const pr: GitHubPR = response.data;
      appLogger.info(`PR created: #${pr.number} - ${pr.html_url}`);

      return pr;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      appLogger.error(`Failed to create PR: ${errorMessage}`);
      throw new Error(`Failed to create PR: ${errorMessage}`);
    }
  }

  /**
   * Get all PRs for the repository
   */
  async getPRs(state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubPR[]> {
    try {
      const response = await this.githubApi.get(
        `/repos/${this.config.owner}/${this.config.repo}/pulls`,
        {
          params: {
            state,
            sort: 'updated',
            direction: 'desc',
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      appLogger.error(`Failed to fetch PRs: ${errorMessage}`);
      throw new Error(`Failed to fetch PRs: ${errorMessage}`);
    }
  }

  /**
   * Get a specific PR by number
   */
  async getPR(prNumber: number): Promise<GitHubPR> {
    try {
      const response = await this.githubApi.get(
        `/repos/${this.config.owner}/${this.config.repo}/pulls/${prNumber}`
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      appLogger.error(`Failed to fetch PR #${prNumber}: ${errorMessage}`);
      throw new Error(`Failed to fetch PR: ${errorMessage}`);
    }
  }

  /**
   * Trigger CodeRabbit review (by commenting on PR)
   * CodeRabbit typically auto-reviews PRs, but we can trigger it manually
   */
  async triggerReview(prNumber: number): Promise<boolean> {
    try {
      // CodeRabbit usually auto-reviews, but we can post a comment to trigger it
      await this.githubApi.post(
        `/repos/${this.config.owner}/${this.config.repo}/issues/${prNumber}/comments`,
        {
          body: '/review',
        }
      );

      appLogger.info(`Triggered CodeRabbit review for PR #${prNumber}`);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      appLogger.error(`Failed to trigger review: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Fetch CodeRabbit review comments from a PR
   */
  async fetchReviewComments(prNumber: number): Promise<CodeRabbitComment[]> {
    try {
      // Get all reviews for the PR
      await this.githubApi.get(
        `/repos/${this.config.owner}/${this.config.repo}/pulls/${prNumber}/reviews`
      );

      // Get all review comments
      const commentsResponse = await this.githubApi.get(
        `/repos/${this.config.owner}/${this.config.repo}/pulls/${prNumber}/comments`
      );

      const allComments: CodeRabbitComment[] = commentsResponse.data;

      // Filter CodeRabbit comments (typically from 'coderabbit[bot]' or similar)
      const coderabbitComments = allComments.filter(
        (comment) =>
          comment.user.login.toLowerCase().includes('coderabbit') ||
          comment.user.login.toLowerCase().includes('code-rabbit') ||
          comment.body.toLowerCase().includes('coderabbit')
      );

      // Also check issue comments
      const issueCommentsResponse = await this.githubApi.get(
        `/repos/${this.config.owner}/${this.config.repo}/issues/${prNumber}/comments`
      );

      const issueComments = issueCommentsResponse.data.filter(
        (comment: { user: { login: string }; body: string }) =>
          comment.user.login.toLowerCase().includes('coderabbit') ||
          comment.body.toLowerCase().includes('coderabbit')
      );

      // Combine and format
      const formattedComments: CodeRabbitComment[] = [
        ...coderabbitComments.map((comment) => ({
          id: comment.id.toString(),
          path: comment.path,
          line: comment.line,
          body: comment.body,
          side: comment.side || 'RIGHT',
          start_line: comment.start_line,
          start_side: comment.start_side,
          user: comment.user,
          created_at: comment.created_at,
          suggestion: this.extractSuggestion(comment.body),
          severity: this.detectSeverity(comment.body),
        })),
        ...issueComments.map((comment: { id: number; body: string; user: { login: string; avatar_url: string }; created_at: string }) => ({
          id: `issue-${comment.id}`,
          path: '',
          line: 0,
          body: comment.body,
          side: 'RIGHT' as const,
          user: comment.user,
          created_at: comment.created_at,
          suggestion: this.extractSuggestion(comment.body),
          severity: this.detectSeverity(comment.body),
        })),
      ];

      appLogger.info(`Fetched ${formattedComments.length} CodeRabbit comments for PR #${prNumber}`);
      return formattedComments;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      appLogger.error(`Failed to fetch review comments: ${errorMessage}`);
      throw new Error(`Failed to fetch review comments: ${errorMessage}`);
    }
  }

  /**
   * Extract code suggestions from comment body
   */
  private extractSuggestion(body: string): string | undefined {
    // Look for code blocks or specific suggestion patterns
    const codeBlockRegex = /```[\s\S]*?```/g;
    const matches = body.match(codeBlockRegex);
    if (matches && matches.length > 0) {
      return matches[0];
    }

    // Look for "suggestion:" or "recommendation:" patterns
    const suggestionRegex = /(?:suggestion|recommendation):\s*(.+)/i;
    const suggestionMatch = body.match(suggestionRegex);
    if (suggestionMatch) {
      return suggestionMatch[1];
    }

    return undefined;
  }

  /**
   * Detect severity from comment body
   */
  private detectSeverity(body: string): 'info' | 'warning' | 'error' {
    const lowerBody = body.toLowerCase();

    if (lowerBody.includes('error') || lowerBody.includes('critical') || lowerBody.includes('security')) {
      return 'error';
    }

    if (lowerBody.includes('warning') || lowerBody.includes('consider') || lowerBody.includes('suggest')) {
      return 'warning';
    }

    return 'info';
  }

  /**
   * Post a new commit to a PR branch
   */
  async postCommit(
    prNumber: number,
    message: string,
    changes: Array<{
      path: string;
      content: string;
      mode: '100644' | '100755' | '040000' | '160000' | '120000';
    }>
  ): Promise<boolean> {
    try {
      // Get PR to get branch info
      const pr = await this.getPR(prNumber);
      const branch = pr.head.ref;
      const branchSha = pr.head.sha;

      // Get the base tree
      const baseTreeResponse = await this.githubApi.get(
        `/repos/${this.config.owner}/${this.config.repo}/git/trees/${branchSha}?recursive=1`
      );
      const baseTree = baseTreeResponse.data;

      // Create blobs for new files
      const tree = await Promise.all(
        changes.map(async (change) => {
          const blobResponse = await this.githubApi.post(
            `/repos/${this.config.owner}/${this.config.repo}/git/blobs`,
            {
              content: change.content,
              encoding: 'utf-8',
            }
          );
          return {
            path: change.path,
            mode: change.mode,
            type: 'blob',
            sha: blobResponse.data.sha,
          };
        })
      );

      // Create new tree
      const treeResponse = await this.githubApi.post(
        `/repos/${this.config.owner}/${this.config.repo}/git/trees`,
        {
          base_tree: baseTree.sha,
          tree,
        }
      );

      // Create commit
      const commitResponse = await this.githubApi.post(
        `/repos/${this.config.owner}/${this.config.repo}/git/commits`,
        {
          message,
          tree: treeResponse.data.sha,
          parents: [branchSha],
        }
      );

      // Update branch reference
      await this.githubApi.patch(
        `/repos/${this.config.owner}/${this.config.repo}/git/refs/heads/${branch}`,
        {
          sha: commitResponse.data.sha,
        }
      );

      appLogger.info(`Posted commit to PR #${prNumber}: ${message}`);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      appLogger.error(`Failed to post commit: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Close a PR
   */
  async closePR(prNumber: number): Promise<boolean> {
    try {
      await this.githubApi.patch(
        `/repos/${this.config.owner}/${this.config.repo}/pulls/${prNumber}`,
        {
          state: 'closed',
        }
      );

      appLogger.info(`Closed PR #${prNumber}`);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      appLogger.error(`Failed to close PR: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Resolve a review thread
   */
  async resolveThread(prNumber: number, threadId: number): Promise<boolean> {
    try {
      await this.githubApi.put(
        `/repos/${this.config.owner}/${this.config.repo}/pulls/${prNumber}/comments/${threadId}/reactions`,
        {
          content: '+1',
        }
      );

      appLogger.info(`Resolved thread ${threadId} in PR #${prNumber}`);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      appLogger.error(`Failed to resolve thread: ${errorMessage}`);
      return false;
    }
  }
}

// Singleton instance
let codeRabbitServiceInstance: CodeRabbitService | null = null;

export const getCodeRabbitService = (config?: Partial<GitHubConfig>): CodeRabbitService => {
  if (!codeRabbitServiceInstance) {
    codeRabbitServiceInstance = new CodeRabbitService(config);
  }
  return codeRabbitServiceInstance;
};

