# CodeRabbit Integration

## Overview

AutoForge integrates CodeRabbit for automated GitHub PR reviews, fulfilling the **Captain Code Award** requirement. The system automatically creates PRs, triggers CodeRabbit reviews, fetches review comments, and allows the FixerAgent to address them automatically using Cline CLI.

## Architecture

### Backend Services

#### CodeRabbitService (`backend/src/core/coderabbit/CodeRabbitService.ts`)

Core service for GitHub API and CodeRabbit integration:

- **GitHub API Integration**: Full GitHub API wrapper for PR management
- **PR Management**: Create, list, get, and close PRs
- **CodeRabbit Review**: Trigger reviews and fetch comments
- **Comment Processing**: Extract suggestions and detect severity
- **Commit Posting**: Post new commits to PR branches

#### CodeRabbitAgent (`backend/src/modules/agents/CodeRabbitAgent.ts`)

Agent that handles CodeRabbit-related tasks:

- `create-pr`: Create a new PR and trigger review
- `fetch-comments`: Fetch CodeRabbit review comments
- `trigger-review`: Manually trigger CodeRabbit review
- `review-latest-commit`: Review the latest commit/PR
- `fix-comments`: Apply fixes to CodeRabbit comments
- `apply-suggestions`: Apply CodeRabbit suggestions
- `close-pr`: Close a PR

#### FixerAgent Integration

The FixerAgent has been enhanced to handle CodeRabbit comments:

- Automatically processes CodeRabbit review comments
- Uses Cline CLI to apply fixes
- Groups comments by file for efficient processing
- Posts fixes back to PR branches

### API Routes (`backend/src/routes/coderabbit.ts`)

- `GET /api/coderabbit/status` - Check GitHub and CodeRabbit connectivity
- `GET /api/coderabbit/prs` - List all PRs
- `GET /api/coderabbit/prs/:prNumber` - Get specific PR
- `POST /api/coderabbit/prs` - Create a new PR
- `POST /api/coderabbit/prs/:prNumber/trigger-review` - Trigger CodeRabbit review
- `GET /api/coderabbit/prs/:prNumber/comments` - Fetch review comments
- `POST /api/coderabbit/prs/:prNumber/apply-fixes` - Apply fixes via FixerAgent
- `POST /api/coderabbit/prs/:prNumber/close` - Close a PR
- `POST /api/coderabbit/webhook` - GitHub webhook endpoint

### Frontend

#### CodeRabbitPanel (`frontend/src/components/CodeRabbitPanel.tsx`)

Dashboard component with:

- Status monitoring (GitHub + CodeRabbit connectivity)
- PR creation form
- PR list with actions
- CodeRabbit comment display
- Apply fixes button

#### CodeRabbit Page (`frontend/src/app/coderabbit/page.tsx`)

Dedicated page at `/coderabbit` for CodeRabbit operations.

## Setup

### Prerequisites

1. **GitHub Token**: Create a personal access token with PR permissions
2. **CodeRabbit**: Install CodeRabbit GitHub App on your repository
3. **Environment Variables**: Configure in `.env`

### Environment Variables

```env
# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_username_or_org
GITHUB_REPO=your_repository_name

# Optional
GITHUB_BASE_BRANCH=main
```

### GitHub Token Permissions

Your GitHub token needs these permissions:

- `repo` (Full control of private repositories)
  - `public_repo` (Access public repositories)
  - `pull_requests` (Read and write pull requests)
  - `contents` (Read and write repository contents)

## Usage

### Using the API

#### Create a PR

```bash
curl -X POST http://localhost:3001/api/coderabbit/prs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Feature",
    "body": "Description",
    "head": "feature/my-feature",
    "base": "main"
  }'
```

#### Fetch Review Comments

```bash
curl http://localhost:3001/api/coderabbit/prs/1/comments
```

#### Apply Fixes

```bash
curl -X POST http://localhost:3001/api/coderabbit/prs/1/apply-fixes
```

### Using npm Scripts

```bash
# Trigger review for PR #1
npm run coderabbit:review 1

# Sync/fetch comments for PR #1
npm run coderabbit:sync 1

# List all PRs
npm run coderabbit:pr
```

### Using the Agent

```typescript
import { getAgentService } from './services/AgentService';

const agentService = getAgentService();
const result = await agentService.executeTask('coderabbit-001', {
  type: 'coderabbit-task',
  payload: {
    action: 'create-pr',
    title: 'My Feature',
    head: 'feature/my-feature',
    base: 'main',
  },
});
```

## Webhook Integration

### Setting Up GitHub Webhooks

1. Go to your repository settings
2. Navigate to Webhooks
3. Add webhook:
   - **Payload URL**: `https://your-domain.com/api/coderabbit/webhook`
   - **Content type**: `application/json`
   - **Events**: Select `Pull requests` and `Pull request reviews`
   - **Secret**: (optional) Add a secret for verification

### Webhook Events Handled

- **pull_request** (opened, synchronize): Automatically triggers CodeRabbit review
- **pull_request_review** (changes_requested, commented): Automatically triggers FixerAgent

## Workflow

### Automated PR Review Flow

1. **Create PR** → CodeRabbit automatically reviews
2. **CodeRabbit posts comments** → Webhook triggers FixerAgent
3. **FixerAgent processes comments** → Uses Cline CLI to apply fixes
4. **Fixes posted to PR** → CodeRabbit reviews again
5. **Cycle continues** until all issues resolved

### Manual Workflow

1. Create PR via dashboard or API
2. Trigger review manually if needed
3. Fetch comments to see review results
4. Apply fixes to address comments
5. Close PR when done

## Features

- ✅ **Full CI/CD-based PR automation**
- ✅ **Auto review using CodeRabbit**
- ✅ **Auto fixing via FixerAgent + Cline CLI**
- ✅ **Web dashboard to view reviews**
- ✅ **API endpoints for programmatic usage**
- ✅ **GitHub webhook integration**
- ✅ **Comment severity detection**
- ✅ **Suggestion extraction**
- ✅ **File-based comment grouping**

## Award Requirements

This integration fulfills the **Captain Code Award** requirement:

- ✅ Full CI/CD-based PR automation
- ✅ Auto review using CodeRabbit
- ✅ Auto fixing via FixerAgent
- ✅ Web dashboard to view reviews
- ✅ API endpoints for programmatic usage
- ✅ Documentation + scripts

## Troubleshooting

### GitHub Connection Issues

- Verify `GITHUB_TOKEN` is set correctly
- Check token has required permissions
- Ensure repository name is correct (format: `owner/repo`)

### CodeRabbit Not Reviewing

- Ensure CodeRabbit GitHub App is installed
- Check CodeRabbit is enabled for the repository
- Verify webhook is configured correctly

### Fixes Not Applied

- Ensure Cline CLI is installed and available
- Check FixerAgent is running
- Verify comments have suggestions

## Examples

See `docs/examples/` for complete usage examples.

