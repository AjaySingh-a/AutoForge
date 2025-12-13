# Vercel Environment Variables Setup - URGENT

## ⚠️ Frontend Environment Variable Required

Your frontend is deployed but cannot connect to the backend because the environment variable is missing.

### Quick Fix:

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your **frontend project** (`auto-forge-frontend`)
3. Go to **Settings** → **Environment Variables**
4. Add this variable:

```
NEXT_PUBLIC_API_URL=https://auto-forge-backend.vercel.app
```

5. Select environments: **Production**, **Preview**, **Development**
6. Click **Save**
7. Go to **Deployments** tab
8. Click **⋯** (three dots) on latest deployment → **Redeploy**

### Backend Environment Variable (Optional but Recommended)

1. Select your **backend project** (`auto-forge-backend`)
2. Go to **Settings** → **Environment Variables**
3. Add this variable:

```
FRONTEND_URL=https://auto-forge-frontend.vercel.app
```

4. Select environments: **Production**, **Preview**, **Development**
5. Click **Save**
6. Redeploy backend

---

## Why This Fixes the Error

- **Frontend** needs `NEXT_PUBLIC_API_URL` to know where the backend is
- Without it, it defaults to `localhost:3001` which doesn't work on Vercel
- **Backend** needs `FRONTEND_URL` for proper CORS configuration

---

## After Setting Variables

1. Wait for redeploy to complete (~2 minutes)
2. Refresh your frontend page
3. The "Failed to fetch agents" error should be gone
4. Agents should load successfully

---

## Verification

After redeploy, test these URLs:

- Frontend: https://auto-forge-frontend.vercel.app
- Backend: https://auto-forge-backend.vercel.app/api/agents

Both should work without errors.

