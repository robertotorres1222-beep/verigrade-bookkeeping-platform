# Supabase Setup Script for VeriGrade Platform
# This script helps automate the Supabase setup process

Write-Host "🎯 VeriGrade Supabase Setup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if required tools are installed
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow

# Check for Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check for npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Starting Supabase setup..." -ForegroundColor Green

# Create Supabase configuration files
Write-Host "`n📁 Creating Supabase configuration files..." -ForegroundColor Yellow

# Create supabase config directory
if (!(Test-Path "supabase")) {
    New-Item -ItemType Directory -Path "supabase" | Out-Null
    Write-Host "✅ Created supabase directory" -ForegroundColor Green
}

# Create supabase config file
$supabaseConfig = @"
{
  "api": {
    "port": 54321,
    "schemas": ["public", "graphql_public"],
    "extra_search_path": ["public", "extensions"],
    "max_rows": 1000
  },
  "db": {
    "port": 54322,
    "shadow_port": 54320,
    "major_version": 15
  },
  "studio": {
    "port": 54323
  },
  "inbucket": {
    "port": 54324,
    "smtp_port": 54325,
    "pop3_port": 54326
  },
  "storage": {
    "port": 54327,
    "file_size_limit": "50MiB"
  },
  "functions": {
    "port": 54328
  },
  "realtime": {
    "port": 54329
  }
}
"@

$supabaseConfig | Out-File -FilePath "supabase\config.toml" -Encoding UTF8
Write-Host "✅ Created supabase/config.toml" -ForegroundColor Green

# Create environment template
$envTemplate = @"
# Supabase Configuration
# Copy this to your .env.local file and fill in the values

# Supabase Project Settings
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-id.supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@verigrade.com

# Frontend Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=https://verigrade-backend-production.up.railway.app
"@

$envTemplate | Out-File -FilePath ".env.supabase.template" -Encoding UTF8
Write-Host "✅ Created .env.supabase.template" -ForegroundColor Green

# Create database schema file
$schemaSQL = @"
-- VeriGrade Database Schema
-- This file contains the complete database schema for the VeriGrade platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'accountant', 'viewer');
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'viewer',
    company_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE public.companies (
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

-- Chart of Accounts
CREATE TABLE public.chart_of_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    account_code TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL, -- asset, liability, equity, revenue, expense
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, account_code)
);

-- Transactions
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference TEXT,
    transaction_type transaction_type NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction Lines (double-entry bookkeeping)
CREATE TABLE public.transaction_lines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers
CREATE TABLE public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address JSONB,
    tax_id TEXT,
    credit_limit DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors
CREATE TABLE public.vendors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address JSONB,
    tax_id TEXT,
    payment_terms INTEGER DEFAULT 30, -- days
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
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
CREATE TABLE public.invoice_lines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Company policies (users can only access their company's data)
CREATE POLICY "Users can view company data" ON public.companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Create indexes for performance
CREATE INDEX idx_transactions_company_date ON public.transactions(company_id, transaction_date);
CREATE INDEX idx_transaction_lines_transaction ON public.transaction_lines(transaction_id);
CREATE INDEX idx_invoices_company_status ON public.invoices(company_id, status);
CREATE INDEX idx_invoice_lines_invoice ON public.invoice_lines(invoice_id);
"@

$schemaSQL | Out-File -FilePath "supabase\schema.sql" -Encoding UTF8
Write-Host "✅ Created supabase/schema.sql" -ForegroundColor Green

# Create sample data file
$sampleDataSQL = @"
-- Sample Data for VeriGrade Platform
-- Run this after creating the schema

-- Insert sample company
INSERT INTO public.companies (name, description, email, website)
VALUES (
    'VeriGrade Demo Company',
    'Sample company for testing the VeriGrade platform',
    'demo@verigrade.com',
    'https://verigrade.com'
);

-- Insert basic chart of accounts
INSERT INTO public.chart_of_accounts (company_id, account_code, account_name, account_type)
VALUES 
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '1000', 'Cash', 'asset'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '1100', 'Accounts Receivable', 'asset'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '1200', 'Inventory', 'asset'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '1300', 'Equipment', 'asset'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '2000', 'Accounts Payable', 'liability'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '2100', 'Accrued Expenses', 'liability'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '3000', 'Owner Equity', 'equity'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '3100', 'Retained Earnings', 'equity'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '4000', 'Sales Revenue', 'revenue'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '5000', 'Cost of Goods Sold', 'expense'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '5100', 'Operating Expenses', 'expense'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '5200', 'Marketing Expenses', 'expense');

-- Insert sample customers
INSERT INTO public.customers (company_id, name, email, phone, address, credit_limit)
VALUES 
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Acme Corp', 'contact@acme.com', '+1-555-0101', '{"street": "123 Business St", "city": "New York", "state": "NY", "zip": "10001"}', 10000.00),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'TechStart Inc', 'info@techstart.com', '+1-555-0102', '{"street": "456 Innovation Ave", "city": "San Francisco", "state": "CA", "zip": "94105"}', 5000.00),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Global Solutions Ltd', 'sales@global.com', '+1-555-0103', '{"street": "789 Enterprise Blvd", "city": "Chicago", "state": "IL", "zip": "60601"}', 25000.00);

-- Insert sample vendors
INSERT INTO public.vendors (company_id, name, email, phone, address, payment_terms)
VALUES 
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Office Supplies Co', 'orders@officesupplies.com', '+1-555-0201', '{"street": "100 Supply St", "city": "Dallas", "state": "TX", "zip": "75201"}', 30),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Software Solutions', 'billing@software.com', '+1-555-0202', '{"street": "200 Tech Park", "city": "Austin", "state": "TX", "zip": "73301"}', 15),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Marketing Agency', 'accounts@marketing.com', '+1-555-0203', '{"street": "300 Creative Ave", "city": "Los Angeles", "state": "CA", "zip": "90210"}', 45);
"@

$sampleDataSQL | Out-File -FilePath "supabase\sample-data.sql" -Encoding UTF8
Write-Host "✅ Created supabase/sample-data.sql" -ForegroundColor Green

# Create test script
$testScript = @"
// Supabase Connection Test Script
// Run this to test your Supabase connection

const { createClient } = require('@supabase/supabase-js')

// Replace with your actual Supabase credentials
const supabaseUrl = 'https://your-project-id.supabase.co'
const supabaseKey = 'your-anon-key-here'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🧪 Testing Supabase connection...')
    
    // Test 1: Basic connection
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    console.log('📊 Sample data:', data)
    
    // Test 2: Authentication (if configured)
    console.log('🔐 Testing authentication...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.log('⚠️  Authentication not configured yet:', authError.message)
    } else {
      console.log('✅ Authentication working')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('🎉 All tests passed! Supabase is ready.')
  } else {
    console.log('💥 Tests failed. Check your configuration.')
  }
})
"@

$testScript | Out-File -FilePath "test-supabase.js" -Encoding UTF8
Write-Host "✅ Created test-supabase.js" -ForegroundColor Green

Write-Host "`n🎉 Supabase setup files created successfully!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://supabase.com and create a new project" -ForegroundColor White
Write-Host "2. Copy your project URL and API keys" -ForegroundColor White
Write-Host "3. Update the .env.supabase.template file with your credentials" -ForegroundColor White
Write-Host "4. Run the SQL schema in your Supabase SQL Editor" -ForegroundColor White
Write-Host "5. Test the connection with: node test-supabase.js" -ForegroundColor White
Write-Host "`n📖 For detailed instructions, see: 🎯_SUPABASE_SETUP_GUIDE.md" -ForegroundColor Cyan

Write-Host "`n✨ Setup complete! Happy coding! 🚀" -ForegroundColor Green