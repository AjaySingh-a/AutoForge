// Vercel serverless function entry point
// This file serves as the entry point for Vercel serverless functions
// Vercel will auto-detect this file in the api/ folder

const path = require('path');

// Try to load the compiled Express app
let app;

try {
  // Import the Express app from the compiled dist folder
  // Path is relative: api/index.js -> ../dist/index.js
  const distPath = path.join(__dirname, '..', 'dist', 'index.js');
  const imported = require(distPath);
  
  // Extract the Express app
  // In CommonJS, default export becomes .default property
  app = imported.default || imported || (imported.module && imported.module.exports) || imported;
  
  if (!app || typeof app !== 'function') {
    throw new Error(`Express app not found or invalid. Type: ${typeof app}, Keys: ${Object.keys(imported || {})}`);
  }
} catch (error) {
  console.error('Error loading Express app:', error.message);
  console.error('Error stack:', error.stack);
  console.error('Current directory:', __dirname);
  console.error('Trying to load from:', path.join(__dirname, '..', 'dist', 'index.js'));
  
  // Create a minimal error handler app
  const express = require('express');
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      error: 'Failed to load application',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      path: req.path
    });
  });
}

// Export the Express app for Vercel
// Vercel's @vercel/node builder expects the Express app directly
module.exports = app;

