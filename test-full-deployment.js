#!/usr/bin/env node

import https from 'https';
import http from 'http';

console.log('🚀 Testing Full VeriGrade Deployment...\n');

// Test URLs
const BACKEND_URL = 'https://verigradebackend-production.up.railway.app';
const FRONTEND_URL = 'https://www.verigradebookkeeping.com';
const SUPABASE_URL = 'https://krdwxeeaxldgnhymukyb.supabase.co';

async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${description}: OK (${res.statusCode})`);
          resolve(true);
        } else {
          console.log(`❌ ${description}: Failed (${res.statusCode})`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${description}: Error - ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log(`❌ ${description}: Timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('Testing Backend Services...');
  const backendHealth = await testEndpoint(`${BACKEND_URL}/health`, 'Backend Health Check');
  const backendAPI = await testEndpoint(`${BACKEND_URL}/api/health`, 'Backend API');
  const backendDB = await testEndpoint(`${BACKEND_URL}/api/test-db`, 'Backend Database Connection');
  
  console.log('\nTesting Frontend...');
  const frontend = await testEndpoint(FRONTEND_URL, 'Frontend Deployment');
  
  console.log('\nTesting Supabase...');
  const supabase = await testEndpoint(`${SUPABASE_URL}/rest/v1/`, 'Supabase API');
  
  console.log('\n📊 Deployment Summary:');
  console.log(`Backend Health: ${backendHealth ? '✅' : '❌'}`);
  console.log(`Backend API: ${backendAPI ? '✅' : '❌'}`);
  console.log(`Database Connection: ${backendDB ? '✅' : '❌'}`);
  console.log(`Frontend: ${frontend ? '✅' : '❌'}`);
  console.log(`Supabase: ${supabase ? '✅' : '❌'}`);
  
  const allWorking = backendHealth && backendAPI && backendDB && frontend && supabase;
  
  if (allWorking) {
    console.log('\n🎉 ALL SERVICES ARE WORKING!');
    console.log(`🌐 Frontend: ${FRONTEND_URL}`);
    console.log(`🔧 Backend: ${BACKEND_URL}`);
    console.log(`📊 Database: ${SUPABASE_URL}`);
  } else {
    console.log('\n⚠️  Some services need attention. Check the errors above.');
  }
}

runTests().catch(console.error);
