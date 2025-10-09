#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting VeriGrade Backend in Production Mode...\n');

// Check if dist directory exists
const fs = require('fs');
const distPath = path.join(__dirname, 'dist', 'index.js');

if (!fs.existsSync(distPath)) {
  console.log('❌ Backend not built. Running build...');
  
  const buildProcess = spawn('npm', ['run', 'build'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Build completed successfully\n');
      startBackend();
    } else {
      console.log('❌ Build failed');
      process.exit(1);
    }
  });
} else {
  console.log('✅ Backend already built\n');
  startBackend();
}

function startBackend() {
  console.log('🔧 Starting backend server...');
  
  // Set required environment variables
  const env = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || '3001',
    JWT_SECRET: process.env.JWT_SECRET || 'verigrade-super-secure-jwt-secret-key-2024-production'
  };

  // Add database URL if provided
  if (process.env.DATABASE_URL) {
    env.DATABASE_URL = process.env.DATABASE_URL;
  }

  const backendProcess = spawn('node', ['dist/index.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: env
  });

  backendProcess.on('close', (code) => {
    console.log(`\n🔚 Backend process exited with code ${code}`);
    process.exit(code);
  });

  backendProcess.on('error', (error) => {
    console.error(`❌ Failed to start backend: ${error.message}`);
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    backendProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    backendProcess.kill('SIGTERM');
  });
}
