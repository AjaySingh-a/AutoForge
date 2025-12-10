#!/usr/bin/env node

/**
 * AutoForge Post-Deployment Health Check Script
 * Validates deployment after Vercel deployment
 */

const https = require('https');
const http = require('http');

const config = {
  frontendUrl: process.env.FRONTEND_URL || process.argv[2] || '',
  backendUrl: process.env.BACKEND_URL || process.argv[3] || '',
  deploymentId: process.env.DEPLOYMENT_ID || process.argv[4] || '',
};

const results = {
  backend: { pass: false, tests: [] },
  frontend: { pass: false, tests: [] },
  loadTest: { pass: false, results: [] },
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 10000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function checkBackendHealth() {
  console.log('\n🔍 Checking Backend Health...\n');
  
  if (!config.backendUrl) {
    console.log('⚠️  BACKEND_URL not provided. Skipping backend checks.');
    console.log('   Set BACKEND_URL environment variable or pass as argument.');
    return;
  }

  const endpoints = [
    { path: '/health', name: 'Health Check' },
    { path: '/api/agents', name: 'Agents API' },
    { path: '/api/cline/status', name: 'Cline Status' },
    { path: '/api/coderabbit/status', name: 'CodeRabbit Status' },
  ];

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await makeRequest(`${config.backendUrl}${endpoint.path}`);
      const latency = Date.now() - startTime;

      const passed = response.status === 200;
      results.backend.tests.push({
        endpoint: endpoint.path,
        name: endpoint.name,
        status: response.status,
        latency: `${latency}ms`,
        passed,
        error: passed ? null : `Status ${response.status}`,
      });

      console.log(
        passed ? '✅' : '❌',
        `${endpoint.name}: ${response.status} (${latency}ms)`
      );
    } catch (error) {
      results.backend.tests.push({
        endpoint: endpoint.path,
        name: endpoint.name,
        status: 'ERROR',
        latency: 'N/A',
        passed: false,
        error: error.message,
      });
      console.log('❌', `${endpoint.name}: ERROR - ${error.message}`);
    }
  }

  results.backend.pass = results.backend.tests.every((t) => t.passed);
  console.log(`\nBackend Health: ${results.backend.pass ? '✅ PASS' : '❌ FAIL'}`);
}

async function checkFrontendHealth() {
  console.log('\n🔍 Checking Frontend Health...\n');
  
  if (!config.frontendUrl) {
    console.log('⚠️  FRONTEND_URL not provided. Skipping frontend checks.');
    console.log('   Set FRONTEND_URL environment variable or pass as argument.');
    return;
  }

  const pages = [
    { path: '/', name: 'Home Page' },
    { path: '/cline', name: 'Cline Page' },
    { path: '/coderabbit', name: 'CodeRabbit Page' },
  ];

  for (const page of pages) {
    try {
      const startTime = Date.now();
      const response = await makeRequest(`${config.frontendUrl}${page.path}`);
      const latency = Date.now() - startTime;

      const passed = response.status === 200;
      results.frontend.tests.push({
        page: page.path,
        name: page.name,
        status: response.status,
        latency: `${latency}ms`,
        passed,
        error: passed ? null : `Status ${response.status}`,
      });

      console.log(
        passed ? '✅' : '❌',
        `${page.name}: ${response.status} (${latency}ms)`
      );
    } catch (error) {
      results.frontend.tests.push({
        page: page.path,
        name: page.name,
        status: 'ERROR',
        latency: 'N/A',
        passed: false,
        error: error.message,
      });
      console.log('❌', `${page.name}: ERROR - ${error.message}`);
    }
  }

  results.frontend.pass = results.frontend.tests.every((t) => t.passed);
  console.log(`\nFrontend Health: ${results.frontend.pass ? '✅ PASS' : '❌ FAIL'}`);
}

async function runLoadTest() {
  console.log('\n🔍 Running Load Test...\n');
  
  if (!config.backendUrl) {
    console.log('⚠️  BACKEND_URL not provided. Skipping load test.');
    return;
  }

  const endpoints = [
    '/api/agents',
    '/api/cline/status',
    '/api/coderabbit/status',
  ];

  const requests = 30;
  const resultsByEndpoint = {};

  for (const endpoint of endpoints) {
    resultsByEndpoint[endpoint] = {
      total: 0,
      success: 0,
      errors: 0,
      latencies: [],
    };

    console.log(`Testing ${endpoint} (${requests} requests)...`);

    for (let i = 0; i < requests; i++) {
      try {
        const startTime = Date.now();
        const response = await makeRequest(`${config.backendUrl}${endpoint}`);
        const latency = Date.now() - startTime;

        resultsByEndpoint[endpoint].total++;
        if (response.status === 200) {
          resultsByEndpoint[endpoint].success++;
        } else {
          resultsByEndpoint[endpoint].errors++;
        }
        resultsByEndpoint[endpoint].latencies.push(latency);

        if ((i + 1) % 10 === 0) {
          process.stdout.write('.');
        }
      } catch (error) {
        resultsByEndpoint[endpoint].errors++;
        resultsByEndpoint[endpoint].latencies.push(0);
      }
    }

    const avgLatency = resultsByEndpoint[endpoint].latencies.reduce((a, b) => a + b, 0) / requests;
    const maxLatency = Math.max(...resultsByEndpoint[endpoint].latencies);
    const minLatency = Math.min(...resultsByEndpoint[endpoint].latencies.filter((l) => l > 0));

    results.loadTest.results.push({
      endpoint,
      total: requests,
      success: resultsByEndpoint[endpoint].success,
      errors: resultsByEndpoint[endpoint].errors,
      successRate: `${((resultsByEndpoint[endpoint].success / requests) * 100).toFixed(1)}%`,
      avgLatency: `${avgLatency.toFixed(0)}ms`,
      minLatency: `${minLatency}ms`,
      maxLatency: `${maxLatency}ms`,
      passed: resultsByEndpoint[endpoint].success === requests && avgLatency < 500,
    });

    console.log(`\n  Success: ${resultsByEndpoint[endpoint].success}/${requests}`);
    console.log(`  Avg Latency: ${avgLatency.toFixed(0)}ms`);
    console.log(`  Status: ${resultsByEndpoint[endpoint].success === requests && avgLatency < 500 ? '✅ PASS' : '❌ FAIL'}`);
  }

  results.loadTest.pass = results.loadTest.results.every((r) => r.passed);
  console.log(`\nLoad Test: ${results.loadTest.pass ? '✅ PASS' : '❌ FAIL'}`);
}

function generateReports() {
  const fs = require('fs');

  // Backend Health Report
  const backendReport = `# Backend Health Check Report

**Generated:** ${new Date().toISOString()}
**Backend URL:** ${config.backendUrl || 'Not provided'}

## Test Results

${results.backend.tests.map((test) => `
### ${test.name}
- **Endpoint:** ${test.endpoint}
- **Status:** ${test.status}
- **Latency:** ${test.latency}
- **Result:** ${test.passed ? '✅ PASS' : '❌ FAIL'}
${test.error ? `- **Error:** ${test.error}` : ''}
`).join('\n')}

## Summary

**Overall Status:** ${results.backend.pass ? '✅ PASS' : '❌ FAIL'}
**Tests Passed:** ${results.backend.tests.filter((t) => t.passed).length}/${results.backend.tests.length}
`;

  fs.writeFileSync('POST_DEPLOY_HEALTH_BACKEND.md', backendReport);

  // Frontend Health Report
  const frontendReport = `# Frontend Health Check Report

**Generated:** ${new Date().toISOString()}
**Frontend URL:** ${config.frontendUrl || 'Not provided'}

## Test Results

${results.frontend.tests.map((test) => `
### ${test.name}
- **Page:** ${test.page}
- **Status:** ${test.status}
- **Latency:** ${test.latency}
- **Result:** ${test.passed ? '✅ PASS' : '❌ FAIL'}
${test.error ? `- **Error:** ${test.error}` : ''}
`).join('\n')}

## Summary

**Overall Status:** ${results.frontend.pass ? '✅ PASS' : '❌ FAIL'}
**Tests Passed:** ${results.frontend.tests.filter((t) => t.passed).length}/${results.frontend.tests.length}
`;

  fs.writeFileSync('POST_DEPLOY_HEALTH_FRONTEND.md', frontendReport);

  // Load Test Report
  const loadTestReport = `# Load Test Report

**Generated:** ${new Date().toISOString()}
**Backend URL:** ${config.backendUrl || 'Not provided'}

## Test Results

${results.loadTest.results.map((result) => `
### ${result.endpoint}
- **Total Requests:** ${result.total}
- **Successful:** ${result.success}
- **Errors:** ${result.errors}
- **Success Rate:** ${result.successRate}
- **Avg Latency:** ${result.avgLatency}
- **Min Latency:** ${result.minLatency}
- **Max Latency:** ${result.maxLatency}
- **Result:** ${result.passed ? '✅ PASS' : '❌ FAIL'}
`).join('\n')}

## Summary

**Overall Status:** ${results.loadTest.pass ? '✅ PASS' : '❌ FAIL'}
**All Endpoints:** ${results.loadTest.results.every((r) => r.passed) ? '✅ PASS' : '❌ FAIL'}
`;

  fs.writeFileSync('POST_DEPLOY_LOADTEST_REPORT.md', loadTestReport);
}

async function main() {
  console.log('🚀 AutoForge Post-Deployment Health Check\n');
  console.log('='.repeat(50));
  
  if (!config.frontendUrl && !config.backendUrl) {
    console.log('\n⚠️  No deployment URLs provided.');
    console.log('\nUsage:');
    console.log('  node scripts/post-deploy-check.js <FRONTEND_URL> <BACKEND_URL> [DEPLOYMENT_ID]');
    console.log('\nOr set environment variables:');
    console.log('  FRONTEND_URL=https://your-frontend.vercel.app');
    console.log('  BACKEND_URL=https://your-backend.vercel.app');
    console.log('  DEPLOYMENT_ID=your-deployment-id');
    console.log('\nThen run: node scripts/post-deploy-check.js');
    return;
  }

  console.log(`\nFrontend URL: ${config.frontendUrl || 'Not provided'}`);
  console.log(`Backend URL: ${config.backendUrl || 'Not provided'}`);
  console.log(`Deployment ID: ${config.deploymentId || 'Not provided'}\n`);

  await checkBackendHealth();
  await checkFrontendHealth();
  await runLoadTest();

  generateReports();

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Final Summary:\n');
  console.log(`Backend: ${results.backend.pass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend: ${results.frontend.pass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Load Test: ${results.loadTest.pass ? '✅ PASS' : '❌ FAIL'}`);

  const allPass = results.backend.pass && results.frontend.pass && results.loadTest.pass;
  console.log(`\nOverall: ${allPass ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'}`);

  console.log('\n📄 Reports generated:');
  console.log('  - POST_DEPLOY_HEALTH_BACKEND.md');
  console.log('  - POST_DEPLOY_HEALTH_FRONTEND.md');
  console.log('  - POST_DEPLOY_LOADTEST_REPORT.md');
}

main().catch(console.error);

