// Test Railway Backend with Supabase Integration
// This script tests your Railway backend after configuration

const https = require('https')

console.log('🚂 Testing Railway Backend with Supabase')
console.log('=========================================')
console.log('Backend URL: https://verigrade-backend-production.up.railway.app')
console.log('')

// Test 1: Health Check
async function testHealthCheck() {
  console.log('🔍 Testing health check...')
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'verigrade-backend-production.up.railway.app',
      port: 443,
      path: '/health',
      method: 'GET',
      timeout: 10000
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          if (response.status === 'healthy') {
            console.log('✅ Health check passed')
            console.log('📊 Response:', response)
            resolve(true)
          } else {
            console.log('⚠️  Health check returned unexpected status')
            console.log('📊 Response:', response)
            resolve(false)
          }
        } catch (error) {
          console.log('❌ Health check response not JSON:', data)
          resolve(false)
        }
      })
    })

    req.on('error', (error) => {
      console.log('❌ Health check failed:', error.message)
      resolve(false)
    })

    req.on('timeout', () => {
      console.log('❌ Health check timeout')
      req.destroy()
      resolve(false)
    })

    req.end()
  })
}

// Test 2: Database Connection
async function testDatabaseConnection() {
  console.log('\n🗄️ Testing database connection...')
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'verigrade-backend-production.up.railway.app',
      port: 443,
      path: '/api/test-db',
      method: 'GET',
      timeout: 10000
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          if (response.success) {
            console.log('✅ Database connection successful')
            console.log('📊 Response:', response.message)
            resolve(true)
          } else {
            console.log('❌ Database connection failed')
            console.log('📊 Response:', response.message)
            resolve(false)
          }
        } catch (error) {
          console.log('❌ Database test response not JSON:', data)
          resolve(false)
        }
      })
    })

    req.on('error', (error) => {
      console.log('❌ Database test failed:', error.message)
      resolve(false)
    })

    req.on('timeout', () => {
      console.log('❌ Database test timeout')
      req.destroy()
      resolve(false)
    })

    req.end()
  })
}

// Test 3: API Endpoints
async function testAPIEndpoints() {
  console.log('\n🌐 Testing API endpoints...')
  
  const endpoints = [
    { path: '/api/companies', name: 'Companies' },
    { path: '/api/customers', name: 'Customers' },
    { path: '/api/vendors', name: 'Vendors' },
    { path: '/api/chart-of-accounts', name: 'Chart of Accounts' }
  ]
  
  const results = {}
  
  for (const endpoint of endpoints) {
    try {
      const result = await testEndpoint(endpoint.path, endpoint.name)
      results[endpoint.name] = result
    } catch (error) {
      console.log(`❌ ${endpoint.name} endpoint failed:`, error.message)
      results[endpoint.name] = false
    }
  }
  
  console.log('\n📊 API Endpoint Results:')
  Object.entries(results).forEach(([name, success]) => {
    console.log(`   ${name}: ${success ? '✅ PASS' : '❌ FAIL'}`)
  })
  
  const passedEndpoints = Object.values(results).filter(Boolean).length
  return passedEndpoints > 0
}

async function testEndpoint(path, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'verigrade-backend-production.up.railway.app',
      port: 443,
      path: path,
      method: 'GET',
      timeout: 5000
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 401) {
          console.log(`✅ ${name} endpoint responding (${res.statusCode})`)
          resolve(true)
        } else {
          console.log(`⚠️  ${name} endpoint returned ${res.statusCode}`)
          resolve(false)
        }
      })
    })

    req.on('error', (error) => {
      console.log(`❌ ${name} endpoint failed:`, error.message)
      resolve(false)
    })

    req.on('timeout', () => {
      console.log(`❌ ${name} endpoint timeout`)
      req.destroy()
      resolve(false)
    })

    req.end()
  })
}

// Test 4: Supabase Integration
async function testSupabaseIntegration() {
  console.log('\n🔗 Testing Supabase integration...')
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'verigrade-backend-production.up.railway.app',
      port: 443,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          if (response.supabase === 'configured') {
            console.log('✅ Supabase integration configured')
            resolve(true)
          } else {
            console.log('⚠️  Supabase integration not configured')
            resolve(false)
          }
        } catch (error) {
          console.log('❌ Supabase integration test failed')
          resolve(false)
        }
      })
    })

    req.on('error', (error) => {
      console.log('❌ Supabase integration test failed:', error.message)
      resolve(false)
    })

    req.on('timeout', () => {
      console.log('❌ Supabase integration test timeout')
      req.destroy()
      resolve(false)
    })

    req.end()
  })
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Railway backend tests...\n')
  
  const results = {
    healthCheck: await testHealthCheck(),
    databaseConnection: await testDatabaseConnection(),
    apiEndpoints: await testAPIEndpoints(),
    supabaseIntegration: await testSupabaseIntegration()
  }
  
  console.log('\n📊 Test Results Summary:')
  console.log('========================')
  console.log(`🔍 Health Check: ${results.healthCheck ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🗄️ Database Connection: ${results.databaseConnection ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🌐 API Endpoints: ${results.apiEndpoints ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🔗 Supabase Integration: ${results.supabaseIntegration ? '✅ PASS' : '❌ FAIL'}`)
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n📈 Overall Score: ${passedTests}/${totalTests} tests passed`)
  
  if (results.healthCheck && results.databaseConnection) {
    console.log('\n🎉 Railway backend is working!')
    console.log('✅ Your VeriGrade backend is ready for production')
    
    if (!results.supabaseIntegration) {
      console.log('\n💡 Next step: Configure Supabase environment variables in Railway')
      console.log('1. Go to https://railway.app')
      console.log('2. Add the variables from railway-env-vars-complete.txt')
      console.log('3. Redeploy your service')
    }
    
    if (!results.apiEndpoints) {
      console.log('\n💡 Next step: Set up the database schema in Supabase')
      console.log('1. Go to https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql')
      console.log('2. Run the SQL from 🎯_SUPABASE_DATABASE_SETUP.md')
    }
  } else {
    console.log('\n🔧 Some tests failed - check the setup:')
    console.log('📖 🎯_RAILWAY_BACKEND_SETUP.md')
    console.log('📖 🎯_SUPABASE_DATABASE_SETUP.md')
  }
  
  console.log('\n🎯 Your Railway Backend:')
  console.log(`📊 Dashboard: https://railway.app`)
  console.log(`🔗 Service URL: https://verigrade-backend-production.up.railway.app`)
  console.log(`🔍 Health Check: https://verigrade-backend-production.up.railway.app/health`)
  console.log(`🗄️ Database Test: https://verigrade-backend-production.up.railway.app/api/test-db`)
}

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error)
  process.exit(1)
})
