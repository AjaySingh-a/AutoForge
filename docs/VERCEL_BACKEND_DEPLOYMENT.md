# Vercel Backend Deployment Guide

## Issue Fixed
The `tsc: command not found` error occurs when Vercel doesn't install dependencies in the `backend` directory.

## Solution

### Step 1: Vercel Project Settings
When creating/editing the backend project in Vercel:

1. **Root Directory**: Set to `backend`
2. **Framework Preset**: Leave as "Other" or "Node.js"
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `dist` (auto-detected)
5. **Install Command**: `npm install` (auto-detected)

### Step 2: Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

```
PORT=3001
NODE_ENV=production
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_username
GITHUB_REPO=your_repo
DATABASE_URL=your_database_url (optional)
FRONTEND_URL=https://your-frontend.vercel.app
CLINE_PATH=cline
```

### Step 3: Important Notes

**If Root Directory is set to `backend`:**
- Vercel should automatically run `npm install` in the `backend/` directory
- The `backend/vercel.json` file will be used for configuration
- Build output will be in `backend/dist/`

**If you still get `tsc: command not found`:**
1. Check that Root Directory is correctly set to `backend` (not root)
2. Verify that `backend/package.json` has `typescript` in `devDependencies`
3. Try redeploying after clearing Vercel cache

### Step 4: Verify Build
After deployment, check:
- Build logs show `npm install` running in `backend/` directory
- Build logs show `tsc` command executing successfully
- Output directory `dist/` contains compiled JavaScript files

## Alternative: Manual Build Command
If automatic detection fails, set Build Command to:
```bash
cd backend && npm install && npm run build
```

But this should NOT be needed if Root Directory is set correctly.

