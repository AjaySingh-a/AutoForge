// Vercel serverless function entry point
// This file serves as the entry point for Vercel serverless functions

const path = require('path');
const fs = require('fs');

// Try to load the compiled Express app
let app;

// Try multiple possible paths for the dist folder
// Vercel structure: /var/task/backend/api/index.js -> /var/task/backend/dist/index.js
const possiblePaths = [
  path.join(__dirname, '..', 'dist', 'index.js'),           // api/index.js -> ../dist/index.js (relative)
  path.join(process.cwd(), 'backend', 'dist', 'index.js'),  // /var/task -> /var/task/backend/dist/index.js
  path.join(process.cwd(), 'dist', 'index.js'),             // /var/task -> /var/task/dist/index.js
  '/var/task/backend/dist/index.js',                        // Vercel absolute path (backend root)
  '/var/task/dist/index.js',                                // Vercel absolute path (root)
  path.join(__dirname, 'dist', 'index.js'),                 // Same directory as api (unlikely)
];

let distPath = null;
for (const testPath of possiblePaths) {
  try {
    if (fs.existsSync(testPath)) {
      distPath = testPath;
      console.log('Found dist/index.js at:', distPath);
      break;
    }
  } catch (e) {
    // Continue to next path
  }
}

if (!distPath) {
  console.error('Could not find dist/index.js in any of these locations:');
  possiblePaths.forEach(p => console.error('  -', p));
  console.error('Current __dirname:', __dirname);
  console.error('Current process.cwd():', process.cwd());
  
  // Try to list directory contents
  try {
    console.error('Contents of __dirname:', fs.readdirSync(__dirname));
    console.error('Contents of parent:', fs.readdirSync(path.join(__dirname, '..')));
  } catch (e) {
    console.error('Could not list directories:', e.message);
  }
}

try {
  if (distPath) {
    const imported = require(distPath);
    
    // Extract the Express app
    // In CommonJS, default export becomes .default property
    app = imported.default || imported || (imported.module && imported.module.exports) || imported;
    
    if (!app || typeof app !== 'function') {
      throw new Error(`Express app not found or invalid. Type: ${typeof app}, Keys: ${Object.keys(imported || {})}`);
    }
    
    console.log('Successfully loaded Express app from:', distPath);
  } else {
    throw new Error('dist/index.js not found in any expected location');
  }
} catch (error) {
  console.error('Error loading Express app:', error.message);
  console.error('Error stack:', error.stack);
  console.error('Current directory:', __dirname);
  console.error('Current working directory:', process.cwd());
  
  // Create a minimal error handler app
  const express = require('express');
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      error: 'Failed to load application',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      path: req.path,
      searchedPaths: possiblePaths,
      currentDir: __dirname,
      cwd: process.cwd()
    });
  });
}

// Export the Express app for Vercel
// Vercel's @vercel/node builder expects the Express app directly
module.exports = app;

