// Simple Supabase Test Script
// This tests the basic setup without requiring actual credentials

console.log('🧪 Testing Supabase Setup...')
console.log('================================')

// Test 1: Check if Supabase package is installed
try {
  const { createClient } = require('@supabase/supabase-js')
  console.log('✅ Supabase package installed successfully')
} catch (error) {
  console.log('❌ Supabase package not found:', error.message)
  process.exit(1)
}

// Test 2: Check environment variables
console.log('\n📋 Checking Environment Variables:')
console.log('----------------------------------')

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL'
]

let missingVars = []
let configuredVars = []

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Configured`)
    configuredVars.push(varName)
  } else {
    console.log(`⚠️  ${varName}: Not set`)
    missingVars.push(varName)
  }
})

// Test 3: Create Supabase client (if credentials available)
if (configuredVars.length >= 2) {
  console.log('\n🔗 Testing Supabase Client Creation:')
  console.log('------------------------------------')
  
  try {
    const { createClient } = require('@supabase/supabase-js')
    
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      console.log('✅ Supabase client created successfully')
      console.log(`📊 Supabase URL: ${supabaseUrl}`)
    } else {
      console.log('⚠️  Missing Supabase credentials - client not created')
    }
  } catch (error) {
    console.log('❌ Error creating Supabase client:', error.message)
  }
} else {
  console.log('\n⚠️  Insufficient environment variables for client creation')
}

// Test 4: Check backend server
console.log('\n🌐 Testing Backend Server:')
console.log('---------------------------')

const https = require('https')
const http = require('http')

const testBackend = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'verigrade-backend-production.up.railway.app',
      port: 443,
      path: '/api/test-db',
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
          if (response.success) {
            console.log('✅ Backend server responding')
            console.log(`📊 Response: ${response.message}`)
            resolve(true)
          } else {
            console.log('⚠️  Backend server responding but with issues')
            console.log(`📊 Response: ${response.message}`)
            resolve(false)
          }
        } catch (error) {
          console.log('❌ Backend server response not JSON:', data)
          resolve(false)
        }
      })
    })

    req.on('error', (error) => {
      console.log('❌ Backend server not reachable:', error.message)
      resolve(false)
    })

    req.on('timeout', () => {
      console.log('❌ Backend server timeout')
      req.destroy()
      resolve(false)
    })

    req.end()
  })
}

// Run the test
testBackend().then(success => {
  console.log('\n📊 Test Summary:')
  console.log('================')
  console.log(`✅ Supabase package: Installed`)
  console.log(`📋 Environment variables: ${configuredVars.length}/${requiredVars.length} configured`)
  console.log(`🌐 Backend server: ${success ? 'Reachable' : 'Not reachable'}`)
  
  if (missingVars.length > 0) {
    console.log('\n⚠️  Missing environment variables:')
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`)
    })
    console.log('\n📖 To configure Supabase:')
    console.log('1. Go to https://supabase.com and create a project')
    console.log('2. Copy your project URL and API keys')
    console.log('3. Add them to your environment variables')
    console.log('4. See 🎯_SUPABASE_ENVIRONMENT_SETUP.md for details')
  }
  
  if (success && configuredVars.length >= 2) {
    console.log('\n🎉 Supabase setup is ready for testing!')
  } else {
    console.log('\n🔧 Complete the setup steps above to test Supabase integration')
  }
})
