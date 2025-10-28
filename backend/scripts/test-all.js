#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting comprehensive test suite...\n');

// Test configuration
const config = {
  unit: {
    command: 'npm run test:unit',
    description: 'Unit Tests',
    timeout: 300000 // 5 minutes
  },
  integration: {
    command: 'npm run test:integration',
    description: 'Integration Tests',
    timeout: 600000 // 10 minutes
  },
  e2e: {
    command: 'npm run test:e2e',
    description: 'End-to-End Tests',
    timeout: 900000 // 15 minutes
  },
  load: {
    command: 'npm run test:load',
    description: 'Load Tests',
    timeout: 600000 // 10 minutes
  },
  security: {
    command: 'npm run test:security',
    description: 'Security Tests',
    timeout: 300000 // 5 minutes
  }
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Run a test suite
function runTest(testName, testConfig) {
  console.log(`\n🔍 Running ${testConfig.description}...`);
  
  try {
    const startTime = Date.now();
    
    execSync(testConfig.command, {
      stdio: 'inherit',
      timeout: testConfig.timeout,
      cwd: process.cwd()
    });
    
    const duration = Date.now() - startTime;
    const durationSeconds = (duration / 1000).toFixed(2);
    
    console.log(`✅ ${testConfig.description} passed (${durationSeconds}s)`);
    
    results.passed++;
    results.total++;
    results.details.push({
      name: testName,
      status: 'passed',
      duration: durationSeconds
    });
    
  } catch (error) {
    console.error(`❌ ${testConfig.description} failed`);
    console.error(error.message);
    
    results.failed++;
    results.total++;
    results.details.push({
      name: testName,
      status: 'failed',
      duration: 'N/A',
      error: error.message
    });
  }
}

// Generate test report
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      successRate: results.total > 0 ? ((results.passed / results.total) * 100).toFixed(2) : 0
    },
    details: results.details
  };
  
  // Save report to file
  const reportPath = path.join(process.cwd(), 'test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Test Report Generated: ${reportPath}`);
  
  return report;
}

// Main execution
async function main() {
  const startTime = Date.now();
  
  console.log('🚀 VeriGrade Comprehensive Test Suite');
  console.log('=====================================\n');
  
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    console.error('❌ Error: package.json not found. Please run this script from the project root.');
    process.exit(1);
  }
  
  // Check if test database is available
  console.log('🔍 Checking test environment...');
  
  try {
    // Check if test database is accessible
    execSync('npx prisma db push --schema=./prisma/schema.prisma', { stdio: 'pipe' });
    console.log('✅ Test database is accessible');
  } catch (error) {
    console.error('❌ Error: Test database is not accessible');
    console.error('Please ensure your test database is running and configured correctly.');
    process.exit(1);
  }
  
  // Run all test suites
  for (const [testName, testConfig] of Object.entries(config)) {
    runTest(testName, testConfig);
  }
  
  // Generate and display report
  const report = generateReport();
  
  const totalDuration = Date.now() - startTime;
  const totalDurationMinutes = (totalDuration / 60000).toFixed(2);
  
  console.log('\n📈 Test Summary');
  console.log('===============');
  console.log(`Total Tests: ${report.summary.total}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Success Rate: ${report.summary.successRate}%`);
  console.log(`Total Duration: ${totalDurationMinutes} minutes`);
  
  console.log('\n📋 Detailed Results');
  console.log('===================');
  results.details.forEach(detail => {
    const status = detail.status === 'passed' ? '✅' : '❌';
    console.log(`${status} ${detail.name}: ${detail.status} (${detail.duration}s)`);
    if (detail.error) {
      console.log(`   Error: ${detail.error}`);
    }
  });
  
  // Exit with appropriate code
  if (results.failed > 0) {
    console.log('\n❌ Some tests failed. Please review the results and fix the issues.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! The application is ready for production.');
    process.exit(0);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the main function
main().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});









