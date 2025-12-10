# Load Test Report

**Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Backend URL:** [To be filled after deployment]

## Test Configuration

- **Total Requests per Endpoint:** 30
- **Endpoints Tested:**
  - `/api/agents`
  - `/api/cline/status`
  - `/api/coderabbit/status`
- **Expected Success Rate:** 100%
- **Expected Avg Latency:** < 500ms
- **Max Acceptable Latency:** 1000ms

## Test Results

### Endpoint: /api/agents
- **Total Requests:** 30
- **Successful:** ⏳ Pending
- **Errors:** ⏳ Pending
- **Success Rate:** ⏳ Pending
- **Avg Latency:** ⏳ Pending
- **Min Latency:** ⏳ Pending
- **Max Latency:** ⏳ Pending
- **Status:** ⏳ Pending deployment

### Endpoint: /api/cline/status
- **Total Requests:** 30
- **Successful:** ⏳ Pending
- **Errors:** ⏳ Pending
- **Success Rate:** ⏳ Pending
- **Avg Latency:** ⏳ Pending
- **Min Latency:** ⏳ Pending
- **Max Latency:** ⏳ Pending
- **Status:** ⏳ Pending deployment

### Endpoint: /api/coderabbit/status
- **Total Requests:** 30
- **Successful:** ⏳ Pending
- **Errors:** ⏳ Pending
- **Success Rate:** ⏳ Pending
- **Avg Latency:** ⏳ Pending
- **Min Latency:** ⏳ Pending
- **Max Latency:** ⏳ Pending
- **Status:** ⏳ Pending deployment

## Validation Criteria

- ✅ Success Rate: 100% (all 30 requests succeed)
- ✅ No 429 rate limit errors
- ✅ No 500 server errors
- ✅ Average latency: < 500ms
- ✅ Response stability: Consistent performance

## How to Run

After deployment, run:
```bash
node scripts/post-deploy-check.js <FRONTEND_URL> <BACKEND_URL>
```

The script will automatically:
1. Send 30 requests to each endpoint
2. Measure latency for each request
3. Calculate success rate
4. Generate this report

## Expected Results

All endpoints should achieve:
- **Success Rate:** 100%
- **Avg Latency:** < 500ms
- **No Errors:** 0 errors
- **Stability:** Consistent response times

---

**Note:** This report will be automatically updated after running the load test script.

