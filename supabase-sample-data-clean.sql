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

