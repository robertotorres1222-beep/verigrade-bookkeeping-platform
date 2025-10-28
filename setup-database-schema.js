// Setup Database Schema for VeriGrade Supabase Project
// This script will help you set up the complete database schema

const { createClient } = require('@supabase/supabase-js')

// Your Supabase credentials
const supabaseUrl = 'https://krdwxeeaxldgnhymukyb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU1NTA5NiwiZXhwIjoyMDc1MTMxMDk2fQ.6_mFjsYtT6KxVdbC-6PevKmUJ3MTDwh3hlj8lbGEvOY'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🗄️ Setting up VeriGrade Database Schema')
console.log('=======================================')
console.log('Project: krdwxeeaxldgnhymukyb')
console.log('')

// SQL Schema to create missing tables
const schemaSQL = `
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'accountant', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    address JSONB,
    phone TEXT,
    email TEXT,
    website TEXT,
    tax_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'viewer',
    company_id UUID REFERENCES public.companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chart of Accounts
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    account_code TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL, -- asset, liability, equity, revenue, expense
    parent_account_id UUID REFERENCES public.chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, account_code)
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id),
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status DEFAULT 'draft',
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, invoice_number)
);

-- Invoice Lines
CREATE TABLE IF NOT EXISTS public.invoice_lines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Company policies (users can only access their company's data)
DROP POLICY IF EXISTS "Users can view company data" ON public.companies;
CREATE POLICY "Users can view company data" ON public.companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_company_date ON public.transactions(company_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transaction_lines_transaction ON public.transaction_lines(transaction_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_status ON public.invoices(company_id, status);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice ON public.invoice_lines(invoice_id);
`

// Sample data to insert
const sampleDataSQL = `
-- Insert sample company
INSERT INTO public.companies (name, description, email, website)
VALUES (
    'VeriGrade Demo Company',
    'Sample company for testing the VeriGrade platform',
    'demo@verigrade.com',
    'https://verigrade.com'
) ON CONFLICT DO NOTHING;

-- Insert basic chart of accounts
INSERT INTO public.chart_of_accounts (company_id, account_code, account_name, account_type)
SELECT 
    (SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'),
    account_code,
    account_name,
    account_type
FROM (VALUES 
    ('1000', 'Cash', 'asset'),
    ('1100', 'Accounts Receivable', 'asset'),
    ('1200', 'Inventory', 'asset'),
    ('1300', 'Equipment', 'asset'),
    ('2000', 'Accounts Payable', 'liability'),
    ('2100', 'Accrued Expenses', 'liability'),
    ('3000', 'Owner Equity', 'equity'),
    ('3100', 'Retained Earnings', 'equity'),
    ('4000', 'Sales Revenue', 'revenue'),
    ('5000', 'Cost of Goods Sold', 'expense'),
    ('5100', 'Operating Expenses', 'expense'),
    ('5200', 'Marketing Expenses', 'expense')
) AS accounts(account_code, account_name, account_type)
ON CONFLICT (company_id, account_code) DO NOTHING;
`

async function setupDatabaseSchema() {
  console.log('🚀 Setting up database schema...')
  
  try {
    // Execute the schema SQL
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: schemaSQL
    })
    
    if (error) {
      console.log('❌ Schema setup failed:', error.message)
      console.log('💡 You may need to run this SQL manually in the Supabase SQL Editor')
      console.log('📖 Go to: https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql')
      return false
    }
    
    console.log('✅ Database schema created successfully')
    return true
  } catch (error) {
    console.log('❌ Schema setup failed:', error.message)
    console.log('💡 You may need to run this SQL manually in the Supabase SQL Editor')
    console.log('📖 Go to: https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql')
    return false
  }
}

async function insertSampleData() {
  console.log('\n📊 Inserting sample data...')
  
  try {
    // Insert sample company
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: 'VeriGrade Demo Company',
        description: 'Sample company for testing the VeriGrade platform',
        email: 'demo@verigrade.com',
        website: 'https://verigrade.com'
      })
      .select()
      .single()
    
    if (companyError && !companyError.message.includes('duplicate')) {
      console.log('❌ Failed to insert company:', companyError.message)
      return false
    }
    
    console.log('✅ Sample company created')
    
    // Insert chart of accounts
    const accounts = [
      { account_code: '1000', account_name: 'Cash', account_type: 'asset' },
      { account_code: '1100', account_name: 'Accounts Receivable', account_type: 'asset' },
      { account_code: '1200', account_name: 'Inventory', account_type: 'asset' },
      { account_code: '1300', account_name: 'Equipment', account_type: 'asset' },
      { account_code: '2000', account_name: 'Accounts Payable', account_type: 'liability' },
      { account_code: '2100', account_name: 'Accrued Expenses', account_type: 'liability' },
      { account_code: '3000', account_name: 'Owner Equity', account_type: 'equity' },
      { account_code: '3100', account_name: 'Retained Earnings', account_type: 'equity' },
      { account_code: '4000', account_name: 'Sales Revenue', account_type: 'revenue' },
      { account_code: '5000', account_name: 'Cost of Goods Sold', account_type: 'expense' },
      { account_code: '5100', account_name: 'Operating Expenses', account_type: 'expense' },
      { account_code: '5200', account_name: 'Marketing Expenses', account_type: 'expense' }
    ]
    
    const companyId = company?.id || (await supabaseAdmin.from('companies').select('id').eq('name', 'VeriGrade Demo Company').single()).data?.id
    
    if (companyId) {
      const accountsWithCompanyId = accounts.map(account => ({
        ...account,
        company_id: companyId
      }))
      
      const { error: accountsError } = await supabaseAdmin
        .from('chart_of_accounts')
        .upsert(accountsWithCompanyId, { onConflict: 'company_id,account_code' })
      
      if (accountsError) {
        console.log('⚠️  Some accounts may not have been created:', accountsError.message)
      } else {
        console.log('✅ Chart of accounts created')
      }
    }
    
    return true
  } catch (error) {
    console.log('❌ Sample data insertion failed:', error.message)
    return false
  }
}

async function testSchema() {
  console.log('\n🧪 Testing schema...')
  
  try {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Schema test failed:', error.message)
      return false
    }
    
    console.log('✅ Schema test successful')
    console.log('📊 Companies found:', data.length)
    return true
  } catch (error) {
    console.log('❌ Schema test failed:', error.message)
    return false
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting database setup...\n')
  
  const schemaResult = await setupDatabaseSchema()
  
  if (schemaResult) {
    const sampleDataResult = await insertSampleData()
    const testResult = await testSchema()
    
    console.log('\n📊 Setup Summary:')
    console.log('=================')
    console.log(`🗄️ Schema Setup: ${schemaResult ? '✅ SUCCESS' : '❌ FAILED'}`)
    console.log(`📊 Sample Data: ${sampleDataResult ? '✅ SUCCESS' : '❌ FAILED'}`)
    console.log(`🧪 Schema Test: ${testResult ? '✅ SUCCESS' : '❌ FAILED'}`)
    
    if (schemaResult && testResult) {
      console.log('\n🎉 Database setup complete!')
      console.log('✅ Your VeriGrade database is ready')
      console.log('\n💡 Next steps:')
      console.log('1. Test the connection: node test-supabase-now.js')
      console.log('2. Configure Railway backend with environment variables')
      console.log('3. Test the full integration')
    } else {
      console.log('\n🔧 Manual setup required:')
      console.log('1. Go to https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql')
      console.log('2. Copy and run the contents of supabase/schema.sql')
      console.log('3. Run the test again')
    }
  } else {
    console.log('\n📖 Manual Setup Instructions:')
    console.log('1. Go to https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql')
    console.log('2. Copy the SQL from supabase/schema.sql')
    console.log('3. Paste and run it in the SQL Editor')
    console.log('4. Run: node test-supabase-now.js')
  }
}

// Run the setup
main().catch(error => {
  console.error('❌ Setup failed:', error)
  process.exit(1)
})



