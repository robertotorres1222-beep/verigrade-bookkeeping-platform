# 🎯 Supabase Quick Fix - Missing Tables

## 🔍 **Current Status**

✅ **Working Tables:**
- `customers` (0 records)
- `vendors` (0 records) 
- `invoices` (0 records)

❌ **Missing Tables:**
- `companies`
- `profiles`
- `transactions`
- `chart_of_accounts`
- `transaction_lines`
- `invoice_lines`

## 🚀 **Quick Fix Solution**

The SQL schema was partially executed. Here's how to fix it:

### **Step 1: Check Supabase Dashboard**

1. **Go to Table Editor:**
   - Visit: https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/editor
   - You should see only 3 tables: `customers`, `vendors`, `invoices`

2. **Check SQL Editor for Errors:**
   - Go to: https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql
   - Look for any red error messages

### **Step 2: Re-run the Missing Tables**

Copy and paste this SQL into your Supabase SQL Editor:

```sql
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
    role TEXT DEFAULT 'viewer',
    company_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    account_code TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, account_code)
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference TEXT,
    transaction_type TEXT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transaction_lines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoice_lines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Step 3: Add Sample Data**

After creating the tables, add sample data:

```sql
-- Insert sample company
INSERT INTO public.companies (name, description, email, website)
VALUES (
    'VeriGrade Demo Company',
    'Sample company for testing the VeriGrade platform',
    'demo@verigrade.com',
    'https://verigrade.com'
);

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
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '5200', 'Marketing Expenses', 'expense');
```

### **Step 4: Test the Fix**

After running the SQL:

```bash
node test-supabase-simple.js
```

Expected results:
- ✅ All 9 tables should be accessible
- ✅ Sample company should exist
- ✅ Chart of accounts should have 12 accounts

## 🎯 **Alternative: Use Existing Tables**

If you want to proceed with just the existing tables, you can:

1. **Use the existing structure:**
   - `customers` - for customer management
   - `vendors` - for vendor management  
   - `invoices` - for invoice management

2. **Add missing functionality later:**
   - Companies can be added as a field in existing tables
   - Transactions can be added as invoice-related data

## ✅ **Success Checklist**

- [ ] All 9 tables visible in Table Editor
- [ ] Sample company exists
- [ ] Chart of accounts has data
- [ ] Test script passes
- [ ] No error messages in SQL Editor

## 🚀 **Next Steps**

Once tables are created:

1. **Configure Railway Backend:**
   - Add environment variables
   - Redeploy service

2. **Test Full Integration:**
   - Test backend API
   - Verify frontend connection

---

**Your Supabase Project:**
- **Table Editor:** https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/editor
- **SQL Editor:** https://supabase.com/dashboard/project/krdwxeeaxldgnhymukyb/sql
