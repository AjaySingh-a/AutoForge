# Vercel Build Fix - Cannot Find Module Error

## Problem
Error: `Cannot find module '../dist/index.js'` from `/var/task/backend/api/index.js`

## Root Cause
Vercel is trying to use `api/index.js` but the `dist/` folder doesn't exist because the build command isn't running.

## Solution Applied

### 1. Changed `backend/vercel.json` to point directly to `dist/index.js`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/dist/index.js"
    }
  ]
}
```

### 2. Updated `backend/src/index.ts` to export as CommonJS:
```typescript
module.exports = app;
export default app;
```

## Vercel Project Settings Required

**IMPORTANT:** In Vercel Dashboard → Project Settings → General:

1. **Root Directory:** `backend` ✅
2. **Build Command:** `npm run build` ✅ (Must be set!)
3. **Output Directory:** `dist` ✅
4. **Install Command:** `npm install` ✅

## Verification Steps

After redeploying, check:

1. **Build Logs:** Should show:
   ```
   Running "install" command: `npm install`...
   Running "build" command: `npm run build`...
   > npx tsc
   ```

2. **Function Logs:** Should NOT show "Cannot find module" error

3. **Test URL:** `https://your-backend.vercel.app/health` should return:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "service": "autoforge-backend"
   }
   ```

## If Still Not Working

1. **Clear Vercel Cache:**
   - Go to Deployments → Click "..." → "Redeploy" → Check "Use existing Build Cache" = OFF

2. **Verify Build Command Runs:**
   - Check build logs for `npm run build` output
   - Verify `dist/index.js` exists in build output

3. **Check File Structure:**
   - Ensure `backend/dist/index.js` exists after build
   - Verify `backend/vercel.json` is correct

4. **Alternative:** If build command still doesn't run, add to `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build"
   }
   ```

