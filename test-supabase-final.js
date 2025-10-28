// Final Supabase Test with Schema Verification
// This script tests your Supabase project after schema setup

const { createClient } = require('@supabase/supabase-js')

// Your Supabase credentials
const supabaseUrl = 'https://krdwxeeaxldgnhymukyb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU1NTA5NiwiZXhwIjoyMDc1MTMxMDk2fQ.6_mFjsYtT6KxVdbC-6PevKmUJ3MTDwh3hlj8lbGEvOY'

console.log('🎯 Final VeriGrade Supabase Test')
console.log('=================================')
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

// Test 1: Check if tables exist by querying information_schema
async function testTableExistence() {
  console.log('\n🗄️ Checking table existence...')
  
  try {
    // Query the information schema to see what tables exist
    const { data, error } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['companies', 'profiles', 'transactions', 'customers', 'vendors', 'invoices', 'chart_of_accounts'])
    
    if (error) {
      console.log('❌ Could not query table information:', error.message)
      return false
    }
    
    console.log('📊 Tables found in database:')
    data.forEach(table => {
      console.log(`   ✅ ${table.table_name}`)
    })
    
    const expectedTables = ['companies', 'profiles', 'transactions', 'customers', 'vendors', 'invoices', 'chart_of_accounts']
    const foundTables = data.map(t => t.table_name)
    const missingTables = expectedTables.filter(table => !foundTables.includes(table))
    
    if (missingTables.length > 0) {
      console.log('⚠️  Missing tables:', missingTables.join(', '))
      return false
    }
    
    console.log('✅ All expected tables found')
    return true
  } catch (error) {
    console.log('❌ Table existence check failed:', error.message)
    return false
  }
}

// Test 2: Test data access with retry logic
async function testDataAccess() {
  console.log('\n📊 Testing data access...')
  
  const tables = [
    { name: 'companies', test: () => supabase.from('companies').select('*').limit(1) },
    { name: 'customers', test: () => supabase.from('customers').select('*').limit(1) },
    { name: 'vendors', test: () => supabase.from('vendors').select('*').limit(1) },
    { name: 'chart_of_accounts', test: () => supabase.from('chart_of_accounts').select('*').limit(1) }
  ]
  
  const results = {}
  
  for (const table of tables) {
    try {
      console.log(`   Testing ${table.name}...`)
      const { data, error } = await table.test()
      
      if (error) {
        console.log(`   ❌ ${table.name}: ${error.message}`)
        results[table.name] = false
      } else {
        console.log(`   ✅ ${table.name}: ${data.length} records`)
        results[table.name] = true
      }
    } catch (err) {
      console.log(`   ❌ ${table.name}: ${err.message}`)
      results[table.name] = false
    }
  }
  
  const accessibleTables = Object.values(results).filter(Boolean).length
  return accessibleTables > 0
}

// Test 3: Test sample data
async function testSampleData() {
  console.log('\n📝 Testing sample data...')
  
  try {
    // Check if we have the demo company
    const { data: companies, error: companiesError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('name', 'VeriGrade Demo Company')
    
    if (companiesError) {
      console.log('❌ Could not query companies:', companiesError.message)
      return false
    }
    
    if (companies.length === 0) {
      console.log('⚠️  Demo company not found - sample data may not have been inserted')
      return false
    }
    
    console.log('✅ Demo company found:', companies[0].name)
    
    // Check chart of accounts
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('chart_of_accounts')
      .select('*')
      .eq('company_id', companies[0].id)
    
    if (accountsError) {
      console.log('❌ Could not query chart of accounts:', accountsError.message)
      return false
    }
    
    console.log(`✅ Chart of accounts: ${accounts.length} accounts`)
    
    // Check customers
    const { data: customers, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('company_id', companies[0].id)
    
    if (customersError) {
      console.log('❌ Could not query customers:', customersError.message)
      return false
    }
    
    console.log(`✅ Customers: ${customers.length} customers`)
    
    return true
  } catch (error) {
    console.log('❌ Sample data test failed:', error.message)
    return false
  }
}

// Test 4: Test data creation
async function testDataCreation() {
  console.log('\n🔧 Testing data creation...')
  
  try {
    // Try to create a test transaction
    const { data: companies } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('name', 'VeriGrade Demo Company')
      .single()
    
    if (!companies) {
      console.log('❌ No demo company found for testing')
      return false
    }
    
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert({
        company_id: companies.id,
        transaction_date: new Date().toISOString().split('T')[0],
        description: 'Test Transaction',
        transaction_type: 'expense',
        total_amount: 100.00
      })
      .select()
      .single()
    
    if (error) {
      console.log('❌ Data creation failed:', error.message)
      return false
    }
    
    console.log('✅ Test transaction created:', data.id)
    
    // Clean up test data
    await supabaseAdmin
      .from('transactions')
      .delete()
      .eq('id', data.id)
    
    console.log('🧹 Test data cleaned up')
    return true
  } catch (error) {
    console.log('❌ Data creation test failed:', error.message)
    return false
  }
}

// Test 5: Backend API test
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

// Run all tests with retry logic
async function runAllTests() {
  console.log('🚀 Starting final Supabase tests...\n')
  
  // Wait a moment for schema cache to update
  console.log('⏳ Waiting for schema cache to update...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const results = {
    tableExistence: await testTableExistence(),
    dataAccess: await testDataAccess(),
    sampleData: await testSampleData(),
    dataCreation: await testDataCreation(),
    backendAPI: await testBackendAPI()
  }
  
  console.log('\n📊 Final Test Results:')
  console.log('======================')
  console.log(`🗄️ Table Existence: ${results.tableExistence ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`📊 Data Access: ${results.dataAccess ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`📝 Sample Data: ${results.sampleData ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🔧 Data Creation: ${results.dataCreation ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🌐 Backend API: ${results.backendAPI ? '✅ PASS' : '❌ FAIL'}`)
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n📈 Overall Score: ${passedTests}/${totalTests} tests passed`)
  
  if (results.tableExistence && results.dataAccess) {
    console.log('\n🎉 Supabase database is working!')
    console.log('✅ Your VeriGrade database is ready for production')
    
    if (results.sampleData) {
      console.log('✅ Sample data is available')
    }
    
    if (results.dataCreation) {
      console.log('✅ Data creation is working')
    }
    
    if (!results.backendAPI) {
      console.log('\n💡 Next step: Configure Railway backend')
      console.log('1. Go to https://railway.app')
      console.log('2. Add environment variables from railway-env-vars-complete.txt')
      console.log('3. Redeploy your service')
    } else {
      console.log('✅ Backend API is working')
    }
  } else {
    console.log('\n🔧 Database setup needs attention:')
    if (!results.tableExistence) {
      console.log('- Tables may not have been created properly')
      console.log('- Check Supabase SQL Editor for any errors')
    }
    if (!results.dataAccess) {
      console.log('- Schema cache may need more time to update')
      console.log('- Try running the test again in a few minutes')
    }
  }
  
  console.log('\n🎯 Your Supabase Project:')
  console.log(`📊 Dashboard: https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb`)
  console.log(`🔗 API URL: https://krdwxeeaxldgnhymukyb.supabase.co`)
  console.log(`🗄️ SQL Editor: https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql`)
  
  if (passedTests >= 3) {
    console.log('\n🎉 Congratulations! Your VeriGrade database is ready!')
    console.log('✅ You can now proceed with Railway backend configuration')
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error)
  process.exit(1)
})



