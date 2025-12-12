// Vercel serverless function entry point
// This file serves as the entry point for Vercel serverless functions
const app = require('../dist/index.js');

// Vercel expects the handler to be exported
// The compiled dist/index.js exports the app as default
module.exports = app.default || app;

