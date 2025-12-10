#!/usr/bin/env node

/**
 * Vercel Logs Analysis Script
 * Fetches and analyzes Vercel deployment logs
 */

const { execSync } = require('child_process');
const fs = require('fs');

const deploymentId = process.env.DEPLOYMENT_ID || process.argv[2] || '';

if (!deploymentId) {
  console.log('⚠️  DEPLOYMENT_ID not provided.');
  console.log('\nUsage:');
  console.log('  node scripts/fetch-vercel-logs.js <DEPLOYMENT_ID>');
  console.log('\nOr set environment variable:');
  console.log('  export DEPLOYMENT_ID=your-deployment-id');
  console.log('  node scripts/fetch-vercel-logs.js');
  console.log('\nTo get deployment ID:');
  console.log('  vercel ls');
  console.log('  vercel inspect <deployment-url>');
  process.exit(1);
}

function analyzeLogs(logs) {
  const analysis = {
    errors: [],
    warnings: [],
    failedInitializations: [],
    edgeFunctionSlowdowns: [],
    summary: {
      totalLines: 0,
      errorCount: 0,
      warningCount: 0,
    },
  };

  const lines = logs.split('\n');
  analysis.summary.totalLines = lines.length;

  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();

    // Detect errors
    if (lowerLine.includes('error') || lowerLine.includes('failed') || lowerLine.includes('exception')) {
      analysis.errors.push({
        line: index + 1,
        content: line,
        type: 'error',
      });
      analysis.summary.errorCount++;
    }

    // Detect warnings
    if (lowerLine.includes('warning') || lowerLine.includes('warn')) {
      analysis.warnings.push({
        line: index + 1,
        content: line,
        type: 'warning',
      });
      analysis.summary.warningCount++;
    }

    // Detect initialization failures
    if (lowerLine.includes('initialization') && (lowerLine.includes('fail') || lowerLine.includes('error'))) {
      analysis.failedInitializations.push({
        line: index + 1,
        content: line,
      });
    }

    // Detect edge function slowdowns
    if (lowerLine.includes('edge') && (lowerLine.includes('slow') || lowerLine.includes('timeout') || lowerLine.includes('> 1000'))) {
      analysis.edgeFunctionSlowdowns.push({
        line: index + 1,
        content: line,
      });
    }
  });

  return analysis;
}

function generateReport(analysis) {
  const report = `# Vercel Logs Summary

**Generated:** ${new Date().toISOString()}
**Deployment ID:** ${deploymentId}

## Summary

- **Total Log Lines:** ${analysis.summary.totalLines}
- **Errors Found:** ${analysis.summary.errorCount}
- **Warnings Found:** ${analysis.summary.warningCount}

## Errors

${analysis.errors.length > 0
    ? analysis.errors
        .slice(0, 20)
        .map((e) => `- Line ${e.line}: ${e.content.substring(0, 100)}`)
        .join('\n')
    : '✅ No errors found'}

${analysis.errors.length > 20 ? `\n... and ${analysis.errors.length - 20} more errors` : ''}

## Warnings

${analysis.warnings.length > 0
    ? analysis.warnings
        .slice(0, 20)
        .map((w) => `- Line ${w.line}: ${w.content.substring(0, 100)}`)
        .join('\n')
    : '✅ No warnings found'}

${analysis.warnings.length > 20 ? `\n... and ${analysis.warnings.length - 20} more warnings` : ''}

## Failed Initializations

${analysis.failedInitializations.length > 0
    ? analysis.failedInitializations.map((f) => `- Line ${f.line}: ${f.content.substring(0, 100)}`).join('\n')
    : '✅ No failed initializations'}

## Edge Function Slowdowns

${analysis.edgeFunctionSlowdowns.length > 0
    ? analysis.edgeFunctionSlowdowns.map((s) => `- Line ${s.line}: ${s.content.substring(0, 100)}`).join('\n')
    : '✅ No edge function slowdowns detected'}

## Recommendations

${analysis.summary.errorCount > 0
    ? '⚠️  Review errors above and fix issues before production use.'
    : '✅ No critical errors found.'}

${analysis.summary.warningCount > 10
    ? '⚠️  High number of warnings. Review and optimize if needed.'
    : '✅ Warning count is acceptable.'}

${analysis.failedInitializations.length > 0
    ? '⚠️  Some initializations failed. Check environment variables and dependencies.'
    : '✅ All initializations successful.'}

${analysis.edgeFunctionSlowdowns.length > 0
    ? '⚠️  Edge function slowdowns detected. Consider optimization.'
    : '✅ No edge function performance issues.'}

## How to Fetch Logs

If Vercel CLI is installed:
\`\`\`bash
vercel logs ${deploymentId}
\`\`\`

Or use Vercel Dashboard:
1. Go to your project
2. Navigate to Deployments
3. Click on the deployment
4. View logs in the Logs tab
`;

  fs.writeFileSync('VERCEL_LOGS_SUMMARY.md', report);
  console.log('✅ Logs analysis report generated: VERCEL_LOGS_SUMMARY.md');
}

function main() {
  console.log('📋 Fetching Vercel Logs...\n');
  console.log(`Deployment ID: ${deploymentId}\n`);

  try {
    // Try to use Vercel CLI if available
    console.log('Attempting to fetch logs via Vercel CLI...');
    const logs = execSync(`vercel logs ${deploymentId}`, { encoding: 'utf8' });
    console.log('✅ Logs fetched successfully\n');

    const analysis = analyzeLogs(logs);
    generateReport(analysis);

    console.log('\n📊 Analysis Summary:');
    console.log(`  Total Lines: ${analysis.summary.totalLines}`);
    console.log(`  Errors: ${analysis.summary.errorCount}`);
    console.log(`  Warnings: ${analysis.summary.warningCount}`);
    console.log(`  Failed Initializations: ${analysis.failedInitializations.length}`);
    console.log(`  Edge Function Slowdowns: ${analysis.edgeFunctionSlowdowns.length}`);
  } catch (error) {
    console.log('⚠️  Could not fetch logs automatically.');
    console.log('\nPossible reasons:');
    console.log('  1. Vercel CLI not installed');
    console.log('  2. Not authenticated with Vercel');
    console.log('  3. Invalid deployment ID');
    console.log('\nTo install Vercel CLI:');
    console.log('  npm i -g vercel');
    console.log('\nTo authenticate:');
    console.log('  vercel login');
    console.log('\nTo get deployment ID:');
    console.log('  vercel ls');
    console.log('\nAlternatively, manually copy logs from Vercel Dashboard and save to a file.');
    console.log('Then run: node scripts/analyze-logs.js <log-file.txt>');
  }
}

main();

