// Vercel serverless function entry point
// This file serves as the entry point for Vercel serverless functions

// Import the Express app from the compiled dist folder
// Path is relative: api/index.js -> ../dist/index.js
// The compiled dist/index.js exports the app as default (exports.default = app)
const imported = require('../dist/index.js');

// Extract the Express app
// In CommonJS, default export becomes .default property
const app = imported.default || imported;

// Export the Express app for Vercel
// Vercel's @vercel/node builder expects the Express app directly
module.exports = app;

