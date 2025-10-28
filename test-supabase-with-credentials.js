// Supabase Test Script with Real Credentials
// Run this after setting up your Supabase project and environment variables

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

console.log('🧪 Testing Supabase with Real Credentials...')
console.log('============================================')

// Check environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase credentials')
  console.log('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file')
  console.log('See 🎯_SUPABASE_TESTING_GUIDE.md for setup instructions')
  process.exit(1)
}

console.log('✅ Supabase credentials found')
console.log(`📊 Supabase URL: ${supabaseUrl}`)

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

console.log('✅ Supabase client created')

// Test 1: Basic connection
async function testBasicConnection() {
  console.log('\n🔗 Testing basic connection...')
  
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    console.log('📊 Sample data:', data)
    return true
  } catch (error) {
    console.log('❌ Connection test failed:', error.message)
    return false
  }
}

// Test 2: Authentication
async function testAuthentication() {
  console.log('\n🔐 Testing authentication...')
  
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('⚠️  Authentication not configured yet:', error.message)
      return false
    }
    
    console.log('✅ Authentication working')
    console.log('📊 Session data:', data)
    return true
  } catch (error) {
    console.log('❌ Authentication test failed:', error.message)
    return false
  }
}

// Test 3: Admin operations (if service key available)
async function testAdminOperations() {
  if (!supabaseAdmin) {
    console.log('\n⚠️  Service role key not available - skipping admin tests')
    return false
  }
  
  console.log('\n🔧 Testing admin operations...')
  
  try {
    // Test creating a profile (this would normally require authentication)
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Admin operations failed:', error.message)
      return false
    }
    
    console.log('✅ Admin operations working')
    console.log('📊 Profile data:', data)
    return true
  } catch (error) {
    console.log('❌ Admin operations test failed:', error.message)
    return false
  }
}

// Test 4: Backend API
async function testBackendAPI() {
  console.log('\n🌐 Testing backend API...')
  
  const https = require('https')
  
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
            console.log('✅ Backend API responding')
            console.log('📊 Response:', response.message)
            resolve(true)
          } else {
            console.log('⚠️  Backend API responding but with issues')
            console.log('📊 Response:', response.message)
            resolve(false)
          }
        } catch (error) {
          console.log('❌ Backend API response not JSON:', data)
          resolve(false)
        }
      })
    })

    req.on('error', (error) => {
      console.log('❌ Backend API not reachable:', error.message)
      resolve(false)
    })

    req.on('timeout', () => {
      console.log('❌ Backend API timeout')
      req.destroy()
      resolve(false)
    })

    req.end()
  })
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive Supabase tests...\n')
  
  const results = {
    basicConnection: await testBasicConnection(),
    authentication: await testAuthentication(),
    adminOperations: await testAdminOperations(),
    backendAPI: await testBackendAPI()
  }
  
  console.log('\n📊 Test Results Summary:')
  console.log('========================')
  console.log(`🔗 Basic Connection: ${results.basicConnection ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🔐 Authentication: ${results.authentication ? '✅ PASS' : '⚠️  NOT CONFIGURED'}`)
  console.log(`🔧 Admin Operations: ${results.adminOperations ? '✅ PASS' : '⚠️  NOT AVAILABLE'}`)
  console.log(`🌐 Backend API: ${results.backendAPI ? '✅ PASS' : '❌ FAIL'}`)
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n📈 Overall Score: ${passedTests}/${totalTests} tests passed`)
  
  if (results.basicConnection && results.backendAPI) {
    console.log('\n🎉 Supabase integration is working!')
    console.log('✅ Your VeriGrade platform is ready for development')
  } else {
    console.log('\n🔧 Some tests failed - check the setup guides:')
    console.log('📖 🎯_SUPABASE_SETUP_GUIDE.md')
    console.log('📖 🎯_SUPABASE_TESTING_GUIDE.md')
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error)
  process.exit(1)
})



