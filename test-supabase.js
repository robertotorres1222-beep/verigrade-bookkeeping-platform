// Supabase Connection Test Script
// Run this to test your Supabase connection

const { createClient } = require('@supabase/supabase-js')

// Replace with your actual Supabase credentials
const supabaseUrl = 'https://your-project-id.supabase.co'
const supabaseKey = 'your-anon-key-here'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('ðŸ§ª Testing Supabase connection...')
    
    // Test 1: Basic connection
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('âŒ Connection failed:', error.message)
      return false
    }
    
    console.log('âœ… Database connection successful')
    console.log('ðŸ“Š Sample data:', data)
    
    // Test 2: Authentication (if configured)
    console.log('ðŸ” Testing authentication...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.log('âš ï¸  Authentication not configured yet:', authError.message)
    } else {
      console.log('âœ… Authentication working')
    }
    
    return true
    
  } catch (error) {
    console.error('âŒ Test failed:', error.message)
    return false
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('ðŸŽ‰ All tests passed! Supabase is ready.')
  } else {
    console.log('ðŸ’¥ Tests failed. Check your configuration.')
  }
})
