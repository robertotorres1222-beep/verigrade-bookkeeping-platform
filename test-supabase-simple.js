// Simple Supabase Test - Check what's actually in the database
// This script will help us understand what tables exist

const { createClient } = require('@supabase/supabase-js')

// Your Supabase credentials
const supabaseUrl = 'https://krdwxeeaxldgnhymukyb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU1NTA5NiwiZXhwIjoyMDc1MTMxMDk2fQ.6_mFjsYtT6KxVdbC-6PevKmUJ3MTDwh3hlj8lbGEvOY'

console.log('🔍 Simple Supabase Database Check')
console.log('=================================')
console.log('Project: krdwxeeaxldgnhymukyb')
console.log('')

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('✅ Supabase clients created')

// Test 1: Check what tables we can actually access
async function checkAvailableTables() {
  console.log('\n📋 Checking available tables...')
  
  const tablesToTest = [
    'companies',
    'profiles', 
    'customers',
    'vendors',
    'transactions',
    'chart_of_accounts',
    'invoices',
    'transaction_lines',
    'invoice_lines'
  ]
  
  const results = {}
  
  for (const tableName of tablesToTest) {
    try {
      console.log(`   Testing ${tableName}...`)
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`)
        results[tableName] = { accessible: false, error: error.message }
      } else {
        console.log(`   ✅ ${tableName}: ${data.length} records`)
        results[tableName] = { accessible: true, count: data.length }
      }
    } catch (err) {
      console.log(`   ❌ ${tableName}: ${err.message}`)
      results[tableName] = { accessible: false, error: err.message }
    }
  }
  
  return results
}

// Test 2: Try to create a simple table to test permissions
async function testTableCreation() {
  console.log('\n🔧 Testing table creation permissions...')
  
  try {
    // Try to create a simple test table
    const { data, error } = await supabaseAdmin
      .from('test_table')
      .insert({ test_field: 'test_value' })
      .select()
    
    if (error) {
      console.log('❌ Cannot create test data:', error.message)
      return false
    }
    
    console.log('✅ Can create data in existing tables')
    
    // Clean up
    await supabaseAdmin
      .from('test_table')
      .delete()
      .eq('test_field', 'test_value')
    
    return true
  } catch (error) {
    console.log('❌ Table creation test failed:', error.message)
    return false
  }
}

// Test 3: Check if we can access the auth schema
async function testAuthAccess() {
  console.log('\n🔐 Testing auth access...')
  
  try {
    const { data, error } = await supabaseAdmin
      .from('auth.users')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Cannot access auth.users:', error.message)
      return false
    }
    
    console.log('✅ Can access auth schema')
    return true
  } catch (error) {
    console.log('❌ Auth access test failed:', error.message)
    return false
  }
}

// Test 4: Check database connection with a simple query
async function testDatabaseConnection() {
  console.log('\n🗄️ Testing database connection...')
  
  try {
    // Try a simple query that should work on any PostgreSQL database
    const { data, error } = await supabaseAdmin
      .rpc('version')
    
    if (error) {
      console.log('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection working')
    console.log('📊 Database info:', data)
    return true
  } catch (error) {
    console.log('❌ Database connection test failed:', error.message)
    return false
  }
}

// Main test function
async function runSimpleTests() {
  console.log('🚀 Starting simple database tests...\n')
  
  const results = {
    availableTables: await checkAvailableTables(),
    tableCreation: await testTableCreation(),
    authAccess: await testAuthAccess(),
    databaseConnection: await testDatabaseConnection()
  }
  
  console.log('\n📊 Test Results Summary:')
  console.log('========================')
  
  // Show table access results
  console.log('\n📋 Table Access Results:')
  Object.entries(results.availableTables).forEach(([table, result]) => {
    if (result.accessible) {
      console.log(`   ✅ ${table}: ${result.count} records`)
    } else {
      console.log(`   ❌ ${table}: ${result.error}`)
    }
  })
  
  console.log(`\n🔧 Table Creation: ${results.tableCreation ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🔐 Auth Access: ${results.authAccess ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🗄️ Database Connection: ${results.databaseConnection ? '✅ PASS' : '❌ FAIL'}`)
  
  const accessibleTables = Object.values(results.availableTables).filter(r => r.accessible).length
  const totalTables = Object.keys(results.availableTables).length
  
  console.log(`\n📈 Table Access Score: ${accessibleTables}/${totalTables} tables accessible`)
  
  if (accessibleTables > 0) {
    console.log('\n🎉 Some tables are accessible!')
    console.log('✅ Your Supabase database is working')
    
    if (accessibleTables < totalTables) {
      console.log('\n💡 Some tables may not have been created yet')
      console.log('📖 Check the Supabase SQL Editor for any errors')
      console.log('🔗 Go to: https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql')
    }
  } else {
    console.log('\n🔧 No tables are accessible')
    console.log('💡 The database schema may not have been created')
    console.log('📖 Please check the Supabase SQL Editor for errors')
    console.log('🔗 Go to: https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql')
  }
  
  console.log('\n🎯 Next Steps:')
  console.log('1. Check Supabase Table Editor for visible tables')
  console.log('2. Check SQL Editor for any error messages')
  console.log('3. If needed, re-run the database schema')
  console.log('4. Configure Railway backend with environment variables')
}

// Run the tests
runSimpleTests().catch(error => {
  console.error('❌ Test suite failed:', error)
  process.exit(1)
})