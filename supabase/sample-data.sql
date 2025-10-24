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
