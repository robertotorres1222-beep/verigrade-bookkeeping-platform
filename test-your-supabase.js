// Test Supabase Integration for VeriGrade Project
// Project ID: krdwxeeaxldgnhymukyb

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

console.log('🎯 Testing VeriGrade Supabase Integration')
console.log('=========================================')
console.log('Project ID: krdwxeeaxldgnhymukyb')
console.log('Project URL: https://krdwxeeaxldgnhymukyb.supabase.co')
console.log('')

// Check environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://krdwxeeaxldgnhymukyb.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('📋 Environment Check:')
console.log('---------------------')
console.log(`SUPABASE_URL: ${supabaseUrl}`)
console.log(`SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`)
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`)

if (!supabaseAnonKey) {
  console.log('\n❌ Missing Supabase credentials!')
  console.log('📖 Please follow the setup instructions:')
  console.log('1. Go to https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb')
  console.log('2. Go to Settings → API')
  console.log('3. Copy your anon public key')
  console.log('4. Set SUPABASE_ANON_KEY in your environment')
  console.log('\nSee QUICK_SETUP_INSTRUCTIONS.md for details')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

console.log('\n✅ Supabase client created successfully')

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
    // Try to access different tables
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

// Test 3: Backend API
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

// Test 4: Create test data (if admin key available)
async function testCreateData() {
  if (!supabaseAdmin) {
    console.log('\n⚠️  Service role key not available - skipping data creation test')
    return false
  }
  
  console.log('\n📝 Testing data creation...')
  
  try {
    // Try to create a test company
    const { data, error } = await supabaseAdmin
      .from('companies')
      .insert({
        name: 'Test Company',
        description: 'Test company for VeriGrade integration',
        email: 'test@verigrade.com'
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

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive tests for VeriGrade Supabase integration...\n')
  
  const results = {
    basicConnection: await testBasicConnection(),
    schemaExists: await testSchemaExists(),
    backendAPI: await testBackendAPI(),
    createData: await testCreateData()
  }
  
  console.log('\n📊 Test Results Summary:')
  console.log('========================')
  console.log(`🔗 Basic Connection: ${results.basicConnection ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🗄️ Schema Exists: ${results.schemaExists ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🌐 Backend API: ${results.backendAPI ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`📝 Data Creation: ${results.createData ? '✅ PASS' : '⚠️  NOT TESTED'}`)
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n📈 Overall Score: ${passedTests}/${totalTests} tests passed`)
  
  if (results.basicConnection && results.backendAPI) {
    console.log('\n🎉 VeriGrade Supabase integration is working!')
    console.log('✅ Your platform is ready for development')
    
    if (!results.schemaExists) {
      console.log('\n💡 Next step: Run the database schema in Supabase')
      console.log('1. Go to https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql')
      console.log('2. Copy and run the contents of supabase/schema.sql')
    }
  } else {
    console.log('\n🔧 Some tests failed - check the setup:')
    console.log('📖 QUICK_SETUP_INSTRUCTIONS.md')
    console.log('📖 🎯_SUPABASE_SETUP_GUIDE.md')
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



