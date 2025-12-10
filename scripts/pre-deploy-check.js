#!/usr/bin/env node

/**
 * AutoForge Pre-Deployment Checklist Validator
 * Runs diagnostics and validates deployment readiness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const results = {
  structure: { pass: true, issues: [] },
  scripts: { pass: true, issues: [] },
  builds: { pass: false, issues: [] },
  cline: { pass: false, issues: [] },
  env: { pass: true, issues: [] },
  git: { pass: false, issues: [] },
};

console.log('🔍 AutoForge Pre-Deployment Checklist\n');
console.log('=' .repeat(50));

// A. Validate Project Structure
console.log('\n📁 A. Validating Project Structure...');
const requiredDirs = [
  'backend',
  'frontend',
  'docs',
  'backend/src',
  'backend/src/routes',
  'backend/src/core',
  'backend/src/modules',
  'backend/src/services',
  'frontend/src/app',
  'frontend/src/components',
];

requiredDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    results.structure.pass = false;
    results.structure.issues.push(`Missing: ${dir}`);
  }
});

console.log(results.structure.pass ? '✅ PASS' : '❌ FAIL');
if (results.structure.issues.length > 0) {
  results.structure.issues.forEach((issue) => console.log(`   - ${issue}`));
}

// B. Verify Scripts
console.log('\n📜 B. Verifying Package.json Scripts...');
const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredBackendScripts = ['build', 'start', 'test', 'cline:check'];
const requiredFrontendScripts = ['build', 'start', 'test'];

requiredBackendScripts.forEach((script) => {
  if (!backendPkg.scripts[script]) {
    results.scripts.pass = false;
    results.scripts.issues.push(`Backend missing: ${script}`);
  }
});

requiredFrontendScripts.forEach((script) => {
  if (!frontendPkg.scripts[script]) {
    results.scripts.pass = false;
    results.scripts.issues.push(`Frontend missing: ${script}`);
  }
});

console.log(results.scripts.pass ? '✅ PASS' : '❌ FAIL');
if (results.scripts.issues.length > 0) {
  results.scripts.issues.forEach((issue) => console.log(`   - ${issue}`));
}

// C. Check Builds
console.log('\n🔨 C. Checking Builds...');
try {
  if (fs.existsSync('backend/dist')) {
    console.log('   ✅ Backend dist/ exists');
  } else {
    results.builds.issues.push('Backend dist/ not found - run: cd backend && npm run build');
  }
} catch (e) {
  results.builds.issues.push('Backend build check failed');
}

try {
  if (fs.existsSync('frontend/.next')) {
    console.log('   ✅ Frontend .next/ exists');
  } else {
    results.builds.issues.push('Frontend .next/ not found - run: cd frontend && npm run build');
  }
} catch (e) {
  results.builds.issues.push('Frontend build check failed');
}

if (results.builds.issues.length === 0) {
  results.builds.pass = true;
}

console.log(results.builds.pass ? '✅ PASS' : '⚠️  PENDING');
if (results.builds.issues.length > 0) {
  results.builds.issues.forEach((issue) => console.log(`   - ${issue}`));
}

// D. Check Cline
console.log('\n🔧 D. Checking Cline CLI...');
try {
  execSync('cline --version', { stdio: 'ignore' });
  results.cline.pass = true;
  console.log('   ✅ Cline CLI is installed');
} catch (e) {
  results.cline.issues.push('Cline CLI not found - install: npm install -g cline');
  console.log('   ❌ Cline CLI not installed');
  console.log('   📝 Install with: npm install -g cline');
}

// E. Check Environment Templates
console.log('\n📝 E. Checking Environment Templates...');
if (fs.existsSync('backend/env.template')) {
  console.log('   ✅ backend/env.template exists');
} else {
  results.env.issues.push('backend/env.template missing');
  results.env.pass = false;
}

if (fs.existsSync('frontend/env.local.template')) {
  console.log('   ✅ frontend/env.local.template exists');
} else {
  results.env.issues.push('frontend/env.local.template missing');
  results.env.pass = false;
}

console.log(results.env.pass ? '✅ PASS' : '❌ FAIL');
if (results.env.issues.length > 0) {
  results.env.issues.forEach((issue) => console.log(`   - ${issue}`));
}

// F. Check Git Status
console.log('\n📦 F. Checking Git Status...');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim().length === 0) {
    results.git.pass = true;
    console.log('   ✅ Git working directory is clean');
  } else {
    results.git.issues.push('Uncommitted changes detected');
    console.log('   ⚠️  Uncommitted changes found');
    console.log('   📝 Run: git add . && git commit -m "AutoForge: pre-deploy setup"');
  }
} catch (e) {
  results.git.issues.push('Git check failed - may not be a git repo');
  console.log('   ⚠️  Git check failed');
}

// Final Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Final Summary:\n');

const allPass = Object.values(results).every((r) => r.pass);

Object.entries(results).forEach(([key, result]) => {
  const icon = result.pass ? '✅' : '❌';
  const name = key.charAt(0).toUpperCase() + key.slice(1);
  console.log(`${icon} ${name}: ${result.pass ? 'PASS' : 'FAIL'}`);
});

if (allPass) {
  console.log('\n🎉 AutoForge Checklist Completed — Ready for Vercel Deployment!');
} else {
  console.log('\n⚠️  Some checklist items failed. Please address the issues above.');
  console.log('\n📋 See PRE_DEPLOYMENT_CHECKLIST.md for detailed instructions.');
}

process.exit(allPass ? 0 : 1);

