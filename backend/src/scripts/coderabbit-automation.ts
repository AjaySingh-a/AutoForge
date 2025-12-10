#!/usr/bin/env node

/**
 * CodeRabbit Automation Script
 * Captain Code Award Requirement
 * 
 * This script automates CodeRabbit PR reviews and fixes
 */

import { getCodeRabbitService } from '../core/coderabbit/CodeRabbitService';
import { getAgentService } from '../services/AgentService';
import { logger } from '../utils/logger';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const codeRabbitService = getCodeRabbitService();
  const agentService = getAgentService();

  try {
    switch (command) {
      case 'review':
        // Trigger review for a PR
        const prNumber = parseInt(args[1], 10);
        if (isNaN(prNumber)) {
          console.error('Usage: coderabbit-automation review <PR_NUMBER>');
          process.exit(1);
        }
        await codeRabbitService.triggerReview(prNumber);
        console.log(`✅ Review triggered for PR #${prNumber}`);
        break;

      case 'fetch':
        // Fetch comments for a PR
        const prNum = parseInt(args[1], 10);
        if (isNaN(prNum)) {
          console.error('Usage: coderabbit-automation fetch <PR_NUMBER>');
          process.exit(1);
        }
        const comments = await codeRabbitService.fetchReviewComments(prNum);
        console.log(`✅ Fetched ${comments.length} comments for PR #${prNum}`);
        break;

      case 'fix':
        // Auto-fix CodeRabbit comments
        const pr = parseInt(args[1], 10);
        if (isNaN(pr)) {
          console.error('Usage: coderabbit-automation fix <PR_NUMBER>');
          process.exit(1);
        }
        const fixerAgent = agentService.getAllAgents().find((a) => a.type === 'fixer');
        if (!fixerAgent) {
          console.error('❌ FixerAgent not found');
          process.exit(1);
        }
        const commentsToFix = await codeRabbitService.fetchReviewComments(pr);
        await agentService.executeTask(fixerAgent.id, {
          type: 'fix-coderabbit-comments',
          payload: {
            prNumber: pr,
            comments: commentsToFix,
          },
        });
        console.log(`✅ Fixes applied to PR #${pr}`);
        break;

      case 'auto-review':
        // Automatically review all open PRs
        const prs = await codeRabbitService.getPRs('open');
        for (const prItem of prs) {
          await codeRabbitService.triggerReview(prItem.number);
          console.log(`✅ Review triggered for PR #${prItem.number}`);
        }
        console.log(`✅ Auto-review completed for ${prs.length} PRs`);
        break;

      default:
        console.log(`
CodeRabbit Automation Script
Captain Code Award Requirement

Usage:
  coderabbit-automation review <PR_NUMBER>  - Trigger review for a PR
  coderabbit-automation fetch <PR_NUMBER>    - Fetch comments for a PR
  coderabbit-automation fix <PR_NUMBER>     - Auto-fix CodeRabbit comments
  coderabbit-automation auto-review          - Review all open PRs
        `);
        process.exit(0);
    }
  } catch (error) {
    logger.error('CodeRabbit automation error:', error);
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main();

