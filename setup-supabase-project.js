// Quick Supabase Setup for Project: krdwxeeaxldgnhymukyb
// This script helps you configure your Supabase project

const fs = require('fs')
const path = require('path')

console.log('🎯 VeriGrade Supabase Project Setup')
console.log('===================================')
console.log('Project ID: krdwxeeaxldgnhymukyb')
console.log('Project URL: https://krdwxeeaxldgnhymukyb.supabase.co')
console.log('')

// Check if we can access the project
async function testProjectAccess() {
  console.log('🔍 Testing project access...')
  
  try {
    const https = require('https')
    
    return new Promise((resolve) => {
      const options = {
        hostname: 'krdwxeeaxldgnhymukyb.supabase.co',
        port: 443,
        path: '/rest/v1/',
        method: 'GET',
        timeout: 5000,
        headers: {
          'apikey': 'test-key',
          'Authorization': 'Bearer test-token'
        }
      }

      const req = https.request(options, (res) => {
        console.log(`📊 Response status: ${res.statusCode}`)
        
        if (res.statusCode === 200 || res.statusCode === 401) {
          console.log('✅ Project is accessible')
          console.log('📊 Project URL: https://krdwxeeaxldgnhymukyb.supabase.co')
          resolve(true)
        } else {
          console.log('⚠️  Project may not be ready yet')
          resolve(false)
        }
      })

      req.on('error', (error) => {
        console.log('❌ Cannot access project:', error.message)
        console.log('💡 Make sure your Supabase project is created and running')
        resolve(false)
      })

      req.on('timeout', () => {
        console.log('❌ Project access timeout')
        req.destroy()
        resolve(false)
      })

      req.end()
    })
  } catch (error) {
    console.log('❌ Error testing project access:', error.message)
    return false
  }
}

// Create environment template
function createEnvironmentTemplate() {
  console.log('\n📝 Creating environment template...')
  
  const envTemplate = `# Supabase Configuration for VeriGrade Platform
# Project ID: krdwxeeaxldgnhymukyb

# Supabase Project Settings
SUPABASE_URL=https://krdwxeeaxldgnhymukyb.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@verigrade.com

# Frontend Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://krdwxeeaxldgnhymukyb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=https://verigrade-backend-production.up.railway.app`

  fs.writeFileSync('.env.supabase.template', envTemplate)
  console.log('✅ Created .env.supabase.template')
}

// Create Railway environment setup
function createRailwaySetup() {
  console.log('\n🚂 Creating Railway environment setup...')
  
  const railwaySetup = `# Railway Environment Variables Setup
# Add these variables to your Railway project

SUPABASE_URL=https://krdwxeeaxldgnhymukyb.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-here

# Optional Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@verigrade.com`

  fs.writeFileSync('railway-env-vars.txt', railwaySetup)
  console.log('✅ Created railway-env-vars.txt')
}

// Create Vercel environment setup
function createVercelSetup() {
  console.log('\n▲ Creating Vercel environment setup...')
  
  const vercelSetup = `# Vercel Environment Variables Setup
# Add these variables to your Vercel project

NEXT_PUBLIC_SUPABASE_URL=https://krdwxeeaxldgnhymukyb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=https://verigrade-backend-production.up.railway.app

# Optional Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`

  fs.writeFileSync('vercel-env-vars.txt', vercelSetup)
  console.log('✅ Created vercel-env-vars.txt')
}

// Create quick setup instructions
function createQuickSetup() {
  console.log('\n📋 Creating quick setup instructions...')
  
  const instructions = `# Quick Supabase Setup for VeriGrade
# Project ID: krdwxeeaxldgnhymukyb

## 🚀 Step 1: Get Your Credentials

1. Go to https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb
2. Go to Settings → API
3. Copy these values:
   - Project URL: https://krdwxeeaxldgnhymukyb.supabase.co
   - anon public key: (copy from dashboard)
   - service_role secret key: (copy from dashboard)

4. Go to Settings → Database
5. Copy the Connection string and replace [YOUR_PASSWORD] with your database password

## 🚂 Step 2: Configure Railway (Backend)

1. Go to https://railway.app
2. Open your project
3. Go to Variables tab
4. Add these variables:
   - SUPABASE_URL=https://krdwxeeaxldgnhymukyb.supabase.co
   - SUPABASE_ANON_KEY=(your anon key)
   - SUPABASE_SERVICE_ROLE_KEY=(your service role key)
   - DATABASE_URL=(your database connection string)
   - JWT_SECRET=(generate a random string)

5. Click Deploy to apply changes

## ▲ Step 3: Configure Vercel (Frontend)

1. Go to https://vercel.com
2. Open your project
3. Go to Settings → Environment Variables
4. Add these variables:
   - NEXT_PUBLIC_SUPABASE_URL=https://krdwxeeaxldgnhymukyb.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY=(your anon key)
   - NEXT_PUBLIC_API_URL=https://verigrade-backend-production.up.railway.app

5. Redeploy your project

## 🗄️ Step 4: Set Up Database Schema

1. Go to https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql
2. Copy the contents of supabase/schema.sql
3. Paste it into the SQL Editor
4. Click Run to execute

5. (Optional) Add sample data:
   - Copy contents of supabase/sample-data.sql
   - Paste and run in SQL Editor

## 🧪 Step 5: Test Everything

1. Test backend: https://verigrade-backend-production.up.railway.app/api/test-db
2. Test locally: node test-supabase-with-credentials.js
3. Test frontend: Check if it can connect to backend

## ✅ Success Checklist

- [ ] Supabase project accessible
- [ ] Environment variables set in Railway
- [ ] Environment variables set in Vercel
- [ ] Database schema created
- [ ] Backend test endpoint working
- [ ] Frontend can connect to backend

## 🆘 Need Help?

- Check Railway logs: railway logs
- Check Supabase logs: Dashboard → Logs
- Test locally: node test-supabase-simple.js
- Full guide: 🎯_SUPABASE_SETUP_GUIDE.md`

  fs.writeFileSync('QUICK_SETUP_INSTRUCTIONS.md', instructions)
  console.log('✅ Created QUICK_SETUP_INSTRUCTIONS.md')
}

// Main execution
async function main() {
  console.log('🚀 Starting Supabase project setup...\n')
  
  // Test project access
  const projectAccessible = await testProjectAccess()
  
  // Create configuration files
  createEnvironmentTemplate()
  createRailwaySetup()
  createVercelSetup()
  createQuickSetup()
  
  console.log('\n📊 Setup Summary:')
  console.log('=================')
  console.log(`🔗 Project Access: ${projectAccessible ? '✅ ACCESSIBLE' : '⚠️  CHECK PROJECT'}`)
  console.log('📝 Configuration files created')
  console.log('📋 Setup instructions created')
  
  console.log('\n🎯 Next Steps:')
  console.log('1. Get your API keys from Supabase dashboard')
  console.log('2. Add environment variables to Railway and Vercel')
  console.log('3. Run the database schema in Supabase')
  console.log('4. Test the integration')
  
  console.log('\n📖 For detailed instructions, see:')
  console.log('- QUICK_SETUP_INSTRUCTIONS.md')
  console.log('- 🎯_SUPABASE_SETUP_GUIDE.md')
  console.log('- 🎯_SUPABASE_TESTING_GUIDE.md')
  
  console.log('\n✨ Setup files ready! Happy coding! 🚀')
}

// Run the setup
main().catch(error => {
  console.error('❌ Setup failed:', error)
  process.exit(1)
})



