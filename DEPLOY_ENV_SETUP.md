# Vercel Environment Variables Setup

This document contains all environment variables required for AutoForge deployment on Vercel.

## Backend Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
PORT=3001
NODE_ENV=production
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_username
GITHUB_REPO=your_repo
DATABASE_URL=your_database_url
FRONTEND_URL=https://your-frontend.vercel.app
CLINE_PATH=cline
```

### Variable Descriptions:

- **PORT**: Server port (default: 3001)
- **NODE_ENV**: Environment mode (production)
- **GITHUB_TOKEN**: GitHub personal access token for CodeRabbit integration
- **GITHUB_OWNER**: Your GitHub username or organization
- **GITHUB_REPO**: Repository name
- **DATABASE_URL**: PostgreSQL connection string (if using database)
- **FRONTEND_URL**: Frontend deployment URL for CORS
- **CLINE_PATH**: Cline CLI path (optional, defaults to 'cline')

## Frontend Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NODE_ENV=production
```

### Variable Descriptions:

- **NEXT_PUBLIC_API_URL**: Backend API URL (must start with NEXT_PUBLIC_ for client-side access)
- **NODE_ENV**: Environment mode (production)

## Setup Instructions

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable above with your actual values
4. Select environment: **Production**, **Preview**, and **Development**
5. Save and redeploy

## Important Notes

- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Never commit actual tokens/keys to git
- Use Vercel's environment variable encryption
- Update `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` after first deployment to get actual URLs

