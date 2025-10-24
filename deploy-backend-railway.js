const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying VeriGrade Backend to Railway...');

// Create Railway configuration
const railwayConfig = {
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node test-server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
};

// Write railway.json
fs.writeFileSync('backend/railway.json', JSON.stringify(railwayConfig, null, 2));

// Create production environment file
const prodEnv = `
# Production Environment Variables
NODE_ENV=production
PORT=3000
DATABASE_URL=${process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/verigrade'}
REDIS_URL=${process.env.REDIS_URL || 'redis://localhost:6379'}
JWT_SECRET=${process.env.JWT_SECRET || 'your-super-secret-jwt-key'}
API_KEY=${process.env.API_KEY || 'your-api-key'}
`;

fs.writeFileSync('backend/.env.production', prodEnv);

console.log('✅ Railway configuration created');
console.log('📦 Backend ready for Railway deployment');
console.log('');
console.log('🎯 Next steps:');
console.log('1. Install Railway CLI: npm install -g @railway/cli');
console.log('2. Login: railway login');
console.log('3. Deploy: railway deploy');
console.log('');
console.log('🌐 Your backend will be available at: https://your-app.railway.app');



