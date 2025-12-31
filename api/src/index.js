// Azure Functions v4 Programming Model
// All functions are automatically registered when imported
const { app } = require('@azure/functions');

// Import all function definitions
require('./functions/getMedia');
require('./functions/uploadMedia');
require('./functions/updateMedia');
require('./functions/deleteMedia');

// Export the app instance for Azure Functions runtime
module.exports = app;
