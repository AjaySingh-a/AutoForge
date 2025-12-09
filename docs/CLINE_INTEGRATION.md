# Cline CLI Integration

## Overview

AutoForge integrates Cline CLI for AI-powered code generation and assistance, fulfilling the **Infinity Build Award** requirement.

## Installation

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Install Cline CLI

```bash
npm install -g cline
```

### Authenticate

```bash
cline auth
```

This will initiate an authentication wizard to sign you in and configure your preferred AI model provider.

## Integration Architecture

### Backend

The Cline integration is located in `backend/src/core/ClineService.ts`:

- **ClineService**: Singleton service that wraps Cline CLI functionality
- **ClineAgent**: Agent that integrates Cline with the AutoForge agent system
- **API Routes**: RESTful endpoints at `/api/cline/*`

### Frontend

- **ClinePanel**: React component for interacting with Cline CLI
- **Cline Page**: Dedicated page at `/cline` for Cline operations

## API Endpoints

### GET `/api/cline/status`

Check Cline CLI availability and status.

**Response:**
```json
{
  "data": {
    "available": true,
    "version": "1.0.0",
    "authenticated": true
  }
}
```

### POST `/api/cline/execute`

Execute a task using Cline CLI.

**Request Body:**
```json
{
  "task": "Add unit tests to utils.js",
  "files": ["src/utils.js"],
  "context": "Use Jest for testing",
  "workingDirectory": "/path/to/project"
}
```

**Response:**
```json
{
  "data": {
    "success": true,
    "output": "Task completed successfully...",
    "error": null,
    "exitCode": 0
  }
}
```

### POST `/api/cline/command`

Execute a custom Cline command.

**Request Body:**
```json
{
  "command": "--version",
  "workingDirectory": "/path/to/project",
  "timeout": 5000
}
```

### GET `/api/cline/version`

Get Cline CLI version information.

## Usage Examples

### Using the Cline Agent

```typescript
import { getAgentService } from './services/AgentService';

const agentService = getAgentService();
const result = await agentService.executeTask('cline-001', {
  type: 'cline-task',
  payload: {
    task: 'Refactor the authentication module',
    files: ['src/auth.ts'],
    context: 'Use TypeScript best practices'
  }
});
```

### Using ClineService Directly

```typescript
import { getClineService } from './core/ClineService';

const clineService = getClineService();
const result = await clineService.executeTask({
  task: 'Add error handling to API routes',
  files: ['src/routes/api.ts']
});
```

### Using npm Scripts

```bash
# Run Cline interactively
npm run cline

# Check Cline version
npm run cline:check
```

## Environment Variables

Optional environment variable for custom Cline path:

```env
CLINE_PATH=/custom/path/to/cline
```

## Features

- ✅ Automatic Cline CLI detection
- ✅ Task execution with file context
- ✅ Streaming output support
- ✅ Error handling and logging
- ✅ Integration with AutoForge agent system
- ✅ Web dashboard for Cline operations
- ✅ RESTful API for programmatic access

## Troubleshooting

### Cline CLI Not Found

If you see "Cline CLI is not installed", ensure:

1. Cline is installed globally: `npm install -g cline`
2. Cline is in your PATH
3. Restart your terminal/IDE after installation

### Authentication Issues

Run `cline auth` to authenticate with your Cline account.

### Timeout Errors

Increase the timeout in the API request or adjust the default timeout in `ClineService.ts`.

## Award Requirement

This integration fulfills the **Infinity Build Award** requirement:
- ✅ Cline CLI integration in `/core` directory
- ✅ Full integration with agent system
- ✅ Web dashboard for interaction
- ✅ API endpoints for programmatic access

