-- Bank Feed Processing Tables
-- This schema defines tables for storing bank feed processing data, connections, rules, and logs

-- Bank Feed Connections Table
CREATE TABLE IF NOT EXISTS bank_feed_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    bank_id UUID NOT NULL REFERENCES banks(id),
    account_number VARCHAR(50) NOT NULL,
    account_type VARCHAR(20) NOT NULL, -- 'checking', 'savings', 'credit', 'loan'
    connection_status VARCHAR(20) NOT NULL, -- 'pending', 'connected', 'failed', 'disconnected'
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency VARCHAR(20) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bank Feed Rules Table
CREATE TABLE IF NOT EXISTS bank_feed_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    rule_name VARCHAR(100) NOT NULL,
    rule_description TEXT,
    conditions JSONB NOT NULL, -- Rule conditions array
    actions JSONB NOT NULL, -- Rule actions array
    priority INTEGER DEFAULT 0, -- Higher priority rules are evaluated first
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bank Feed Processing Logs Table
CREATE TABLE IF NOT EXISTS bank_feed_processing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES bank_feed_connections(id) ON DELETE CASCADE,
    total_transactions INTEGER DEFAULT 0,
    processed_transactions INTEGER DEFAULT 0,
    duplicate_transactions INTEGER DEFAULT 0,
    error_transactions INTEGER DEFAULT 0,
    new_transactions INTEGER DEFAULT 0,
    updated_transactions INTEGER DEFAULT 0,
    processing_errors JSONB, -- Array of processing errors
    processing_duration_ms INTEGER, -- Processing time in milliseconds
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bank Feed Transactions Table
CREATE TABLE IF NOT EXISTS bank_feed_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES bank_feed_connections(id) ON DELETE CASCADE,
    external_id VARCHAR(100) NOT NULL, -- External transaction ID from bank
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    transaction_type VARCHAR(20) NOT NULL, -- 'debit', 'credit'
    transaction_date DATE NOT NULL,
    posted_date DATE,
    merchant_name VARCHAR(200),
    merchant_category VARCHAR(50),
    reference_number VARCHAR(100),
    check_number VARCHAR(20),
    raw_data JSONB, -- Raw transaction data from bank
    is_processed BOOLEAN DEFAULT FALSE,
    is_duplicate BOOLEAN DEFAULT FALSE,
    processing_errors JSONB, -- Processing errors if any
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bank Feed Sync Jobs Table
CREATE TABLE IF NOT EXISTS bank_feed_sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES bank_feed_connections(id) ON DELETE CASCADE,
    job_type VARCHAR(20) NOT NULL, -- 'full_sync', 'incremental_sync', 'manual_sync'
    status VARCHAR(20) NOT NULL, -- 'pending', 'running', 'completed', 'failed'
    start_date DATE,
    end_date DATE,
    total_transactions INTEGER DEFAULT 0,
    processed_transactions INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bank Feed Error Logs Table
CREATE TABLE IF NOT EXISTS bank_feed_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES bank_feed_connections(id) ON DELETE CASCADE,
    error_type VARCHAR(50) NOT NULL, -- 'connection_error', 'processing_error', 'validation_error'
    error_message TEXT NOT NULL,
    error_details JSONB, -- Additional error details
    transaction_data JSONB, -- Transaction data that caused the error
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bank Feed Analytics Table
CREATE TABLE IF NOT EXISTS bank_feed_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    total_connections INTEGER DEFAULT 0,
    active_connections INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    processed_transactions INTEGER DEFAULT 0,
    duplicate_transactions INTEGER DEFAULT 0,
    error_transactions INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    avg_processing_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Banks Table
CREATE TABLE IF NOT EXISTS banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(20) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bank Feed Templates Table
CREATE TABLE IF NOT EXISTS bank_feed_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_name VARCHAR(100) NOT NULL,
    template_description TEXT,
    template_rules JSONB NOT NULL, -- Template rule definitions
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bank_feed_connections_company_id ON bank_feed_connections(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_feed_connections_bank_id ON bank_feed_connections(bank_id);
CREATE INDEX IF NOT EXISTS idx_bank_feed_connections_status ON bank_feed_connections(connection_status);
CREATE INDEX IF NOT EXISTS idx_bank_feed_connections_active ON bank_feed_connections(is_active);

CREATE INDEX IF NOT EXISTS idx_bank_feed_rules_company_id ON bank_feed_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_feed_rules_priority ON bank_feed_rules(priority);
CREATE INDEX IF NOT EXISTS idx_bank_feed_rules_active ON bank_feed_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_bank_feed_processing_logs_company_id ON bank_feed_processing_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_feed_processing_logs_connection_id ON bank_feed_processing_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_bank_feed_processing_logs_processed_at ON bank_feed_processing_logs(processed_at);

CREATE INDEX IF NOT EXISTS idx_bank_feed_transactions_company_id ON bank_feed_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_feed_transactions_connection_id ON bank_feed_transactions(connection_id);
CREATE INDEX IF NOT EXISTS idx_bank_feed_transactions_external_id ON bank_feed_transactions(external_id);
CREATE INDEX IF NOT EXISTS idx_bank_feed_transactions_transaction_id ON bank_feed_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_bank_feed_transactions_date ON bank_feed_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_feed_transactions_processed ON bank_feed_transactions(is_processed);
CREATE INDEX IF NOT EXISTS idx_bank_feed_transactions_duplicate ON bank_feed_transactions(is_duplicate);

CREATE INDEX IF NOT EXISTS idx_bank_feed_sync_jobs_company_id ON bank_feed_sync_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_feed_sync_jobs_connection_id ON bank_feed_sync_jobs(connection_id);
CREATE INDEX IF NOT EXISTS idx_bank_feed_sync_jobs_status ON bank_feed_sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_bank_feed_sync_jobs_created_at ON bank_feed_sync_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_bank_feed_error_logs_company_id ON bank_feed_error_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_feed_error_logs_connection_id ON bank_feed_error_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_bank_feed_error_logs_error_type ON bank_feed_error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_bank_feed_error_logs_resolved ON bank_feed_error_logs(is_resolved);
CREATE INDEX IF NOT EXISTS idx_bank_feed_error_logs_created_at ON bank_feed_error_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_bank_feed_analytics_company_id ON bank_feed_analytics(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_feed_analytics_analysis_date ON bank_feed_analytics(analysis_date);

CREATE INDEX IF NOT EXISTS idx_banks_name ON banks(bank_name);
CREATE INDEX IF NOT EXISTS idx_banks_code ON banks(bank_code);
CREATE INDEX IF NOT EXISTS idx_banks_country ON banks(country_code);
CREATE INDEX IF NOT EXISTS idx_banks_active ON banks(is_active);

CREATE INDEX IF NOT EXISTS idx_bank_feed_templates_company_id ON bank_feed_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_feed_templates_active ON bank_feed_templates(is_active);

-- Add foreign key constraints
ALTER TABLE bank_feed_connections ADD CONSTRAINT fk_bank_feed_connections_bank 
    FOREIGN KEY (bank_id) REFERENCES banks(id);

ALTER TABLE bank_feed_rules ADD CONSTRAINT fk_bank_feed_rules_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE bank_feed_processing_logs ADD CONSTRAINT fk_bank_feed_processing_logs_connection 
    FOREIGN KEY (connection_id) REFERENCES bank_feed_connections(id);

ALTER TABLE bank_feed_transactions ADD CONSTRAINT fk_bank_feed_transactions_connection 
    FOREIGN KEY (connection_id) REFERENCES bank_feed_connections(id);
ALTER TABLE bank_feed_transactions ADD CONSTRAINT fk_bank_feed_transactions_transaction 
    FOREIGN KEY (transaction_id) REFERENCES transactions(id);

ALTER TABLE bank_feed_sync_jobs ADD CONSTRAINT fk_bank_feed_sync_jobs_connection 
    FOREIGN KEY (connection_id) REFERENCES bank_feed_connections(id);

ALTER TABLE bank_feed_error_logs ADD CONSTRAINT fk_bank_feed_error_logs_connection 
    FOREIGN KEY (connection_id) REFERENCES bank_feed_connections(id);
ALTER TABLE bank_feed_error_logs ADD CONSTRAINT fk_bank_feed_error_logs_resolved_by 
    FOREIGN KEY (resolved_by) REFERENCES users(id);

ALTER TABLE bank_feed_templates ADD CONSTRAINT fk_bank_feed_templates_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);