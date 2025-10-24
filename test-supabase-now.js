// Test Supabase with Real Credentials
// Project ID: krdwxeeaxldgnhymukyb

const { createClient } = require('@supabase/supabase-js')

// Your actual Supabase credentials
const supabaseUrl = 'https://krdwxeeaxldgnhymukyb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU1NTA5NiwiZXhwIjoyMDc1MTMxMDk2fQ.6_mFjsYtT6KxVdbC-6PevKmUJ3MTDwh3hlj8lbGEvOY'

console.log('🎯 Testing VeriGrade Supabase with Real Credentials')
console.log('==================================================')
console.log('Project ID: krdwxeeaxldgnhymukyb')
console.log('Project URL: https://krdwxeeaxldgnhymukyb.supabase.co')
console.log('')

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('✅ Supabase clients created successfully')

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
      console.log('💡 This might mean the database schema is not set up yet')
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

// Test 2: Check if schema exists
async function testSchemaExists() {
  console.log('\n🗄️ Testing database schema...')
  
  try {
    const tables = ['companies', 'profiles', 'transactions', 'customers', 'vendors']
    const results = {}
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          results[table] = `❌ ${error.message}`
        } else {
          results[table] = `✅ Accessible (${data.length} records)`
        }
      } catch (err) {
        results[table] = `❌ ${err.message}`
      }
    }
    
    console.log('📊 Table access results:')
    Object.entries(results).forEach(([table, result]) => {
      console.log(`   ${table}: ${result}`)
    })
    
    const accessibleTables = Object.values(results).filter(r => r.includes('✅')).length
    return accessibleTables > 0
  } catch (error) {
    console.log('❌ Schema test failed:', error.message)
    return false
  }
}

// Test 3: Create test data
async function testCreateData() {
  console.log('\n📝 Testing data creation...')
  
  try {
    // Try to create a test company
    const { data, error } = await supabaseAdmin
      .from('companies')
      .insert({
        name: 'VeriGrade Test Company',
        description: 'Test company for VeriGrade integration',
        email: 'test@verigrade.com',
        website: 'https://verigrade.com'
      })
      .select()
      .single()
    
    if (error) {
      console.log('❌ Data creation failed:', error.message)
      return false
    }
    
    console.log('✅ Data creation successful')
    console.log('📊 Created company:', data)
    
    // Clean up test data
    await supabaseAdmin
      .from('companies')
      .delete()
      .eq('id', data.id)
    
    console.log('🧹 Test data cleaned up')
    return true
  } catch (error) {
    console.log('❌ Data creation test failed:', error.message)
    return false
  }
}

// Test 4: Authentication
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

// Test 5: Backend API
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
    schemaExists: await testSchemaExists(),
    createData: await testCreateData(),
    authentication: await testAuthentication(),
    backendAPI: await testBackendAPI()
  }
  
  console.log('\n📊 Test Results Summary:')
  console.log('========================')
  console.log(`🔗 Basic Connection: ${results.basicConnection ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🗄️ Schema Exists: ${results.schemaExists ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`📝 Data Creation: ${results.createData ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🔐 Authentication: ${results.authentication ? '✅ PASS' : '⚠️  NOT CONFIGURED'}`)
  console.log(`🌐 Backend API: ${results.backendAPI ? '✅ PASS' : '❌ FAIL'}`)
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n📈 Overall Score: ${passedTests}/${totalTests} tests passed`)
  
  if (results.basicConnection) {
    console.log('\n🎉 Supabase connection is working!')
    
    if (!results.schemaExists) {
      console.log('\n💡 Next step: Set up the database schema')
      console.log('1. Go to https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql')
      console.log('2. Copy and run the contents of supabase/schema.sql')
      console.log('3. Run the test again to verify schema is working')
    } else {
      console.log('✅ Database schema is ready!')
    }
    
    if (!results.backendAPI) {
      console.log('\n💡 Next step: Configure Railway backend')
      console.log('1. Go to https://railway.app')
      console.log('2. Add these environment variables:')
      console.log('   SUPABASE_URL=https://krdwxeeaxldgnhymukyb.supabase.co')
      console.log('   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
      console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
      console.log('3. Redeploy your Railway service')
    }
  } else {
    console.log('\n🔧 Supabase connection failed - check your project status')
  }
  
  console.log('\n🎯 Your Supabase Project:')
  console.log(`📊 Dashboard: https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb`)
  console.log(`🔗 API URL: https://krdwxeeaxldgnhymukyb.supabase.co`)
  console.log(`🗄️ SQL Editor: https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql`)
}

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error)
  process.exit(1)
})
