#!/usr/bin/env node

// Simple build script to work around Vercel's cached build command
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting VeriGrade Frontend Build...');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found in current directory');
  process.exit(1);
}

// Check if Next.js is available
if (!fs.existsSync('next.config.ts') && !fs.existsSync('next.config.js')) {
  console.error('❌ Next.js config not found');
  process.exit(1);
}

try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('🔨 Building Next.js application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
