# Backend Health Check Report

**Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Backend URL:** [To be filled after deployment]

## Test Endpoints

### 1. Health Check
- **Endpoint:** `GET /health`
- **Expected:** Status 200 OK
- **Response:** `{ status: 'ok', timestamp: '...', service: 'autoforge-backend' }`
- **Status:** ⏳ Pending deployment

### 2. Agents API
- **Endpoint:** `GET /api/agents`
- **Expected:** Status 200 OK
- **Response:** List of all agents
- **Status:** ⏳ Pending deployment

### 3. Cline Status
- **Endpoint:** `GET /api/cline/status`
- **Expected:** Status 200 OK
- **Response:** Cline CLI availability status
- **Status:** ⏳ Pending deployment

### 4. CodeRabbit Status
- **Endpoint:** `GET /api/coderabbit/status`
- **Expected:** Status 200 OK
- **Response:** GitHub and CodeRabbit connectivity status
- **Status:** ⏳ Pending deployment

## Validation Criteria

- ✅ Status 200 OK for all endpoints
- ✅ JSON structure correct
- ✅ No edge function errors
- ✅ Response time under 1 second
- ✅ No cold start delays

## How to Run

After deployment, run:
```bash
node scripts/post-deploy-check.js <FRONTEND_URL> <BACKEND_URL>
```

Or set environment variables:
```bash
export FRONTEND_URL=https://your-frontend.vercel.app
export BACKEND_URL=https://your-backend.vercel.app
node scripts/post-deploy-check.js
```

## Expected Results

All endpoints should return:
- Status: 200
- Valid JSON response
- Latency: < 1000ms
- No errors in response

---

**Note:** This report will be automatically updated after running the health check script.

