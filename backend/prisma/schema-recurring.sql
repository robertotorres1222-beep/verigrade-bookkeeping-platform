-- Recurring Templates and Items Tables
-- This schema defines tables for storing recurring templates, generation logs, and analytics

-- Recurring Templates Table
CREATE TABLE IF NOT EXISTS recurring_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_name VARCHAR(100) NOT NULL,
    template_description TEXT,
    template_type VARCHAR(20) NOT NULL, -- 'invoice', 'expense', 'payment'
    template_data JSONB NOT NULL, -- Template data for generation
    recurrence_pattern VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly', 'custom'
    recurrence_interval INTEGER DEFAULT 1, -- Interval for recurrence
    recurrence_days JSONB, -- Days of week for weekly recurrence
    recurrence_day_of_month INTEGER, -- Day of month for monthly recurrence
    recurrence_day_of_week INTEGER, -- Day of week for weekly recurrence
    recurrence_month INTEGER, -- Month for yearly recurrence
    start_date DATE NOT NULL,
    end_date DATE, -- Optional end date
    is_active BOOLEAN DEFAULT TRUE,
    last_generated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recurring Generation Logs Table
CREATE TABLE IF NOT EXISTS recurring_generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    total_templates INTEGER DEFAULT 0,
    generated_items INTEGER DEFAULT 0,
    skipped_items INTEGER DEFAULT 0,
    errors JSONB, -- Array of generation errors
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recurring Items Table
CREATE TABLE IF NOT EXISTS recurring_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_id UUID REFERENCES recurring_templates(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL, -- 'invoice', 'expense', 'payment'
    item_id UUID NOT NULL, -- ID of the generated item
    generation_date DATE NOT NULL,
    is_processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recurring Analytics Table
CREATE TABLE IF NOT EXISTS recurring_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    total_templates INTEGER DEFAULT 0,
    active_templates INTEGER DEFAULT 0,
    total_generated INTEGER DEFAULT 0,
    total_skipped INTEGER DEFAULT 0,
    generation_success_rate DECIMAL(5,2) DEFAULT 0,
    avg_generation_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recurring Schedules Table
CREATE TABLE IF NOT EXISTS recurring_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_id UUID REFERENCES recurring_templates(id) ON DELETE CASCADE,
    schedule_name VARCHAR(100) NOT NULL,
    schedule_description TEXT,
    cron_expression VARCHAR(100), -- Cron expression for custom scheduling
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recurring Notifications Table
CREATE TABLE IF NOT EXISTS recurring_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_id UUID REFERENCES recurring_templates(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'generation_success', 'generation_failure', 'template_expiry'
    notification_data JSONB, -- Notification-specific data
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recurring Templates History Table
CREATE TABLE IF NOT EXISTS recurring_templates_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_id UUID REFERENCES recurring_templates(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'activated', 'deactivated'
    old_data JSONB, -- Previous template data
    new_data JSONB, -- New template data
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recurring_templates_company_id ON recurring_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_type ON recurring_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_pattern ON recurring_templates(recurrence_pattern);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_active ON recurring_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_start_date ON recurring_templates(start_date);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_end_date ON recurring_templates(end_date);

CREATE INDEX IF NOT EXISTS idx_recurring_generation_logs_company_id ON recurring_generation_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_recurring_generation_logs_generated_at ON recurring_generation_logs(generated_at);

CREATE INDEX IF NOT EXISTS idx_recurring_items_company_id ON recurring_items(company_id);
CREATE INDEX IF NOT EXISTS idx_recurring_items_template_id ON recurring_items(template_id);
CREATE INDEX IF NOT EXISTS idx_recurring_items_type ON recurring_items(item_type);
CREATE INDEX IF NOT EXISTS idx_recurring_items_generation_date ON recurring_items(generation_date);
CREATE INDEX IF NOT EXISTS idx_recurring_items_processed ON recurring_items(is_processed);

CREATE INDEX IF NOT EXISTS idx_recurring_analytics_company_id ON recurring_analytics(company_id);
CREATE INDEX IF NOT EXISTS idx_recurring_analytics_analysis_date ON recurring_analytics(analysis_date);

CREATE INDEX IF NOT EXISTS idx_recurring_schedules_company_id ON recurring_schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_template_id ON recurring_schedules(template_id);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_active ON recurring_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_next_run ON recurring_schedules(next_run_at);

CREATE INDEX IF NOT EXISTS idx_recurring_notifications_company_id ON recurring_notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_recurring_notifications_template_id ON recurring_notifications(template_id);
CREATE INDEX IF NOT EXISTS idx_recurring_notifications_type ON recurring_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_recurring_notifications_sent ON recurring_notifications(is_sent);

CREATE INDEX IF NOT EXISTS idx_recurring_templates_history_company_id ON recurring_templates_history(company_id);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_history_template_id ON recurring_templates_history(template_id);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_history_action ON recurring_templates_history(action);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_history_changed_at ON recurring_templates_history(changed_at);

-- Add foreign key constraints
ALTER TABLE recurring_templates ADD CONSTRAINT fk_recurring_templates_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE recurring_items ADD CONSTRAINT fk_recurring_items_template 
    FOREIGN KEY (template_id) REFERENCES recurring_templates(id);

ALTER TABLE recurring_schedules ADD CONSTRAINT fk_recurring_schedules_template 
    FOREIGN KEY (template_id) REFERENCES recurring_templates(id);

ALTER TABLE recurring_notifications ADD CONSTRAINT fk_recurring_notifications_template 
    FOREIGN KEY (template_id) REFERENCES recurring_templates(id);

ALTER TABLE recurring_templates_history ADD CONSTRAINT fk_recurring_templates_history_template 
    FOREIGN KEY (template_id) REFERENCES recurring_templates(id);
ALTER TABLE recurring_templates_history ADD CONSTRAINT fk_recurring_templates_history_changed_by 
    FOREIGN KEY (changed_by) REFERENCES users(id);