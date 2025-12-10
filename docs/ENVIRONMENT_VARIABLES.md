# Environment Variables

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# API Keys
OPENAI_API_KEY=your_openai_api_key_here
GITHUB_TOKEN=your_github_token_here
CODERABBIT_API_KEY=your_coderabbit_api_key_here

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/autoforge?schema=public"

# Cline CLI Integration (optional - for custom Cline path)
CLINE_PATH=cline

# GitHub Configuration (for CodeRabbit)
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_username_or_org
GITHUB_REPO=your_repository_name
GITHUB_BASE_BRANCH=main

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

## GitHub Token Setup

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with these permissions:
   - `repo` (Full control of private repositories)
   - `public_repo` (Access public repositories)
   - `pull_requests` (Read and write pull requests)
   - `contents` (Read and write repository contents)
3. Copy the token and add it to `GITHUB_TOKEN` in backend `.env`

## CodeRabbit Setup

1. Install CodeRabbit GitHub App on your repository
2. CodeRabbit will automatically review PRs once installed
3. No additional API key needed (uses GitHub integration)

