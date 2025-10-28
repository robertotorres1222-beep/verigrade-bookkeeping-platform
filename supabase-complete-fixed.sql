-- VeriGrade Clean Database Setup
-- Safe to run multiple times - handles existing objects gracefully

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types with error handling
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
    account_type TEXT NOT NULL,
    parent_account_id UUID REFERENCES public.chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, account_code)
);

-- Transactions
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

-- Transaction Lines (double-entry bookkeeping)
CREATE TABLE IF NOT EXISTS public.transaction_lines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.chart_of_accounts(id),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address JSONB,
    tax_id TEXT,
    payment_terms INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Drop existing policies before creating new ones
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view company data" ON public.companies;

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
CREATE INDEX IF NOT EXISTS idx_transactions_company_date ON public.transactions(company_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transaction_lines_transaction ON public.transaction_lines(transaction_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_status ON public.invoices(company_id, status);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice ON public.invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_customers_company ON public.customers(company_id);
CREATE INDEX IF NOT EXISTS idx_vendors_company ON public.vendors(company_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_company ON public.chart_of_accounts(company_id);

-- VeriGrade Sample Data
-- Safe to run multiple times - uses ON CONFLICT DO NOTHING

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
VALUES 
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '1000', 'Cash', 'asset'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '1100', 'Accounts Receivable', 'asset'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '1200', 'Inventory', 'asset'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '1300', 'Equipment', 'asset'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '1400', 'Furniture & Fixtures', 'asset'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '1500', 'Accumulated Depreciation', 'asset'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '2000', 'Accounts Payable', 'liability'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '2100', 'Accrued Expenses', 'liability'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '2200', 'Short-term Debt', 'liability'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '3000', 'Owner Equity', 'equity'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '3100', 'Retained Earnings', 'equity'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '3200', 'Current Year Earnings', 'equity'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '4000', 'Sales Revenue', 'revenue'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '4100', 'Service Revenue', 'revenue'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '5000', 'Cost of Goods Sold', 'expense'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '5100', 'Operating Expenses', 'expense'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '5200', 'Marketing Expenses', 'expense'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '5300', 'Office Supplies', 'expense'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '5400', 'Utilities', 'expense'),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '5500', 'Professional Services', 'expense')
ON CONFLICT (company_id, account_code) DO NOTHING;

-- Insert sample customers
INSERT INTO public.customers (company_id, name, email, phone, address, credit_limit)
VALUES 
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Acme Corporation', 'contact@acme.com', '+1-555-0101', '{"street": "123 Business St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}', 10000.00),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'TechStart Inc', 'info@techstart.com', '+1-555-0102', '{"street": "456 Innovation Ave", "city": "San Francisco", "state": "CA", "zip": "94105", "country": "USA"}', 5000.00),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Global Solutions Ltd', 'sales@global.com', '+1-555-0103', '{"street": "789 Enterprise Blvd", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}', 25000.00),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Digital Dynamics', 'orders@digital.com', '+1-555-0104', '{"street": "321 Tech Plaza", "city": "Austin", "state": "TX", "zip": "73301", "country": "USA"}', 15000.00),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Future Systems', 'billing@future.com', '+1-555-0105', '{"street": "654 Progress Dr", "city": "Seattle", "state": "WA", "zip": "98101", "country": "USA"}', 20000.00)
ON CONFLICT DO NOTHING;

-- Insert sample vendors
INSERT INTO public.vendors (company_id, name, email, phone, address, payment_terms)
VALUES 
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Office Supplies Co', 'orders@officesupplies.com', '+1-555-0201', '{"street": "100 Supply St", "city": "Dallas", "state": "TX", "zip": "75201", "country": "USA"}', 30),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Software Solutions', 'billing@software.com', '+1-555-0202', '{"street": "200 Tech Park", "city": "Austin", "state": "TX", "zip": "73301", "country": "USA"}', 15),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Marketing Agency', 'accounts@marketing.com', '+1-555-0203', '{"street": "300 Creative Ave", "city": "Los Angeles", "state": "CA", "zip": "90210", "country": "USA"}', 45),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Cloud Services Inc', 'support@cloud.com', '+1-555-0204', '{"street": "400 Data Center Blvd", "city": "Phoenix", "state": "AZ", "zip": "85001", "country": "USA"}', 30),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 'Legal Partners LLC', 'billing@legal.com', '+1-555-0205', '{"street": "500 Law St", "city": "Boston", "state": "MA", "zip": "02101", "country": "USA"}', 60)
ON CONFLICT DO NOTHING;

-- Insert sample transactions
INSERT INTO public.transactions (company_id, transaction_date, description, reference, transaction_type, total_amount)
VALUES 
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '2025-01-01', 'Initial cash deposit', 'INIT-001', 'income'::transaction_type, 50000.00),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '2025-01-02', 'Office rent payment', 'RENT-001', 'expense'::transaction_type, 2500.00),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '2025-01-03', 'Software subscription', 'SW-001', 'expense'::transaction_type, 299.00),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '2025-01-04', 'Client payment received', 'PAY-001', 'income'::transaction_type, 5000.00),
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), '2025-01-05', 'Office supplies purchase', 'SUP-001', 'expense'::transaction_type, 150.00)
ON CONFLICT DO NOTHING;

-- Insert sample invoice
INSERT INTO public.invoices (company_id, customer_id, invoice_number, invoice_date, due_date, status, subtotal, tax_amount, total_amount, notes)
VALUES 
    ((SELECT id FROM companies WHERE name = 'VeriGrade Demo Company'), 
     (SELECT id FROM customers WHERE name = 'Acme Corporation'), 
     'INV-2025-001', '2025-01-01', '2025-01-31', 'sent'::invoice_status, 2500.00, 200.00, 2700.00, 'Monthly consulting services')
ON CONFLICT (company_id, invoice_number) DO NOTHING;

-- Insert invoice lines
INSERT INTO public.invoice_lines (invoice_id, description, quantity, unit_price, line_total)
VALUES 
    ((SELECT i.id FROM invoices i JOIN companies c ON i.company_id = c.id WHERE c.name = 'VeriGrade Demo Company' AND i.invoice_number = 'INV-2025-001'), 
     'Consulting Services - 20 hours', 20.00, 100.00, 2000.00),
    ((SELECT i.id FROM invoices i JOIN companies c ON i.company_id = c.id WHERE c.name = 'VeriGrade Demo Company' AND i.invoice_number = 'INV-2025-001'), 
     'Project Management - 5 hours', 5.00, 100.00, 500.00)
ON CONFLICT DO NOTHING;


