// Vercel serverless function entry point
// This file serves as the entry point for Vercel serverless functions

console.log('Loading Express app from dist/index.js...');

let app;

try {
  // Import the Express app from the compiled dist folder
  // Path is relative: api/index.js -> ../dist/index.js
  const imported = require('../dist/index.js');
  console.log('Imported module:', typeof imported, Object.keys(imported || {}));
  
  // Extract the Express app
  // In CommonJS, default export becomes .default property
  app = imported.default || imported;
  
  if (!app) {
    throw new Error('Express app not found in imported module');
  }
  
  console.log('Express app loaded successfully:', typeof app);
} catch (error) {
  console.error('Error loading Express app:', error);
  console.error('Error stack:', error.stack);
  
  // Create a minimal error handler app
  const express = require('express');
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      error: 'Failed to load application',
      message: error.message,
      path: req.path
    });
  });
}

// Export the Express app for Vercel
// Vercel's @vercel/node builder expects the Express app directly
module.exports = app;

