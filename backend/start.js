#!/usr/bin/env node

/**
 * ExctelCard Backend Server Startup Script
 * This script loads environment variables and starts the server
 */

const fs = require('fs');
const path = require('path');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found. Creating from .env.example...');
  
  const examplePath = path.join(__dirname, '.env.example');
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('✅ .env file created from .env.example');
    console.log('📝 Please update the .env file with your actual configuration values');
  } else {
    console.error('❌ .env.example file not found. Please create environment configuration.');
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();

// Validate required environment variables
const requiredVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SESSION_SECRET',
  'MONGODB_URI'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.log('\n📝 Please update your .env file with the required values.');
  console.log('📖 See ENV_SETUP.md for detailed setup instructions.');
  process.exit(1);
}

// Check for placeholder values that need to be changed
const placeholderChecks = [
  { var: 'JWT_SECRET', contains: 'change-this-in-production' },
  { var: 'JWT_REFRESH_SECRET', contains: 'change-this-in-production' },
  { var: 'SESSION_SECRET', contains: 'change-this-in-production' }
];

const hasPlaceholders = placeholderChecks.some(check => 
  process.env[check.var] && process.env[check.var].includes(check.contains)
);

if (hasPlaceholders && process.env.NODE_ENV === 'production') {
  console.error('❌ Production environment detected with placeholder secrets!');
  console.error('🔒 Please update JWT_SECRET, JWT_REFRESH_SECRET, and SESSION_SECRET with secure values.');
  process.exit(1);
}

if (hasPlaceholders) {
  console.log('⚠️  Development environment detected with placeholder secrets.');
  console.log('🔒 For production, please update with secure random values.');
}

console.log('🚀 Starting ExctelCard Backend Server...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Port: ${process.env.PORT || 5000}`);
console.log(`🗄️  Database: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);

// Start the main application
require('./index.js');
