# 🎯 Complete Supabase Database Fix

## 🔍 **Current Status**

✅ **Working Tables (3/9):**
- `customers` (0 records)
- `vendors` (0 records) 
- `invoices` (0 records)

❌ **Missing Tables (6/9):**
- `companies`
- `profiles`
- `transactions`
- `chart_of_accounts`
- `transaction_lines`
- `invoice_lines`

## 🚀 **Complete Fix Solution**

### **Step 1: Create Missing Tables**

Go to your Supabase SQL Editor: https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql

Copy and paste this complete SQL:

```sql
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

-- Create missing tables
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

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'viewer',
    company_id UUID REFERENCES public.companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    account_code TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    parent_account_id UUID REFERENCES public.chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, account_code)
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference TEXT,
    transaction_type transaction_type NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transaction_lines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.chart_of_accounts(id),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

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
```

### **Step 2: Add Sample Data**

After creating the tables, add sample data:

```sql
-- Insert sample company
INSERT INTO public.companies (name, description, email, website)
VALUES (
    'VeriGrade Demo Company',
    'Sample company for testing the VeriGrade platform',
    'demo@verigrade.com',
    'https://verigrade.com'
) ON CONFLICT DO NOTHING;

-- Insert chart of accounts
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
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '5200', 'Marketing Expenses', 'expense')
ON CONFLICT (company_id, account_code) DO NOTHING;

-- Insert sample customers
INSERT INTO public.customers (company_id, name, email, phone, address, credit_limit)
VALUES 
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Acme Corp', 'contact@acme.com', '+1-555-0101', '{"street": "123 Business St", "city": "New York", "state": "NY", "zip": "10001"}', 10000.00),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'TechStart Inc', 'info@techstart.com', '+1-555-0102', '{"street": "456 Innovation Ave", "city": "San Francisco", "state": "CA", "zip": "94105"}', 5000.00),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Global Solutions Ltd', 'sales@global.com', '+1-555-0103', '{"street": "789 Enterprise Blvd", "city": "Chicago", "state": "IL", "zip": "60601"}', 25000.00)
ON CONFLICT DO NOTHING;

-- Insert sample vendors
INSERT INTO public.vendors (company_id, name, email, phone, address, payment_terms)
VALUES 
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Office Supplies Co', 'orders@officesupplies.com', '+1-555-0201', '{"street": "100 Supply St", "city": "Dallas", "state": "TX", "zip": "75201"}', 30),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Software Solutions', 'billing@software.com', '+1-555-0202', '{"street": "200 Tech Park", "city": "Austin", "state": "TX", "zip": "73301"}', 15),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Marketing Agency', 'accounts@marketing.com', '+1-555-0203', '{"street": "300 Creative Ave", "city": "Los Angeles", "state": "CA", "zip": "90210"}', 45)
ON CONFLICT DO NOTHING;
```

### **Step 3: Test the Fix**

After running the SQL:

```bash
node test-supabase-simple.js
```

Expected results:
- ✅ All 9 tables should be accessible
- ✅ Sample company should exist
- ✅ Chart of accounts should have 12 accounts
- ✅ 3 sample customers should exist
- ✅ 3 sample vendors should exist

### **Step 4: Verify in Supabase Dashboard**

1. **Check Table Editor:**
   - Go to: https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/editor
   - You should see all 9 tables

2. **Check Sample Data:**
   - Click on `companies` table - should see "VeriGrade Demo Company"
   - Click on `customers` table - should see 3 customers
   - Click on `vendors` table - should see 3 vendors
   - Click on `chart_of_accounts` table - should see 12 accounts

## 🚨 **Troubleshooting**

### **If Tables Still Don't Appear:**

1. **Check for SQL Errors:**
   - Look for red error messages in SQL Editor
   - Common issues: permission errors, syntax errors

2. **Wait for Schema Cache:**
   - Sometimes takes 2-3 minutes for changes to propagate
   - Try the test script again after waiting

3. **Check Supabase Plan:**
   - Some features may require a paid plan
   - Check if your plan supports all features

### **If Sample Data Doesn't Insert:**

1. **Check Company ID:**
   - Make sure the company was created first
   - Check if the company name matches exactly

2. **Check Foreign Key Constraints:**
   - Ensure all referenced tables exist
   - Check if UUIDs are valid

## ✅ **Success Checklist**

- [ ] All 9 tables visible in Table Editor
- [ ] Sample company exists
- [ ] Chart of accounts has 12 accounts
- [ ] 3 sample customers exist
- [ ] 3 sample vendors exist
- [ ] Test script passes all checks
- [ ] No error messages in SQL Editor

## 🎯 **Next Steps After Success**

Once your database is working:

1. **Configure Railway Backend:**
   - Add environment variables to Railway
   - Redeploy your service

2. **Test Full Integration:**
   - Test backend API endpoints
   - Verify frontend-backend connection

3. **Set up N8N Automation:**
   - Configure automation workflows
   - Test end-to-end processes

---

**Your Supabase Project:**
- **Table Editor:** https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/editor
- **SQL Editor:** https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql
- **Edge Functions:** https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/functions
