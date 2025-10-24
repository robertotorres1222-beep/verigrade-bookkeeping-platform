-- Custom Report Builder Schema
-- This schema supports drag-and-drop report building with templates, elements, and data sources

-- Report Templates Table
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('financial', 'operational', 'customer', 'inventory', 'custom')),
    layout JSONB NOT NULL DEFAULT '{}',
    data_sources JSONB NOT NULL DEFAULT '[]',
    filters JSONB NOT NULL DEFAULT '[]',
    parameters JSONB NOT NULL DEFAULT '[]',
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_report_templates_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_templates_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Report Builders Table
CREATE TABLE IF NOT EXISTS report_builders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    layout JSONB NOT NULL DEFAULT '{}',
    elements JSONB NOT NULL DEFAULT '[]',
    data_sources JSONB NOT NULL DEFAULT '[]',
    filters JSONB NOT NULL DEFAULT '[]',
    parameters JSONB NOT NULL DEFAULT '[]',
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_report_builders_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_builders_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Report Elements Table
CREATE TABLE IF NOT EXISTS report_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('chart', 'table', 'metric', 'text', 'image', 'filter')),
    title VARCHAR(255) NOT NULL,
    position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "width": 4, "height": 3}',
    config JSONB NOT NULL DEFAULT '{}',
    data_source VARCHAR(255),
    query TEXT,
    filters JSONB NOT NULL DEFAULT '[]',
    styling JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_report_elements_builder FOREIGN KEY (builder_id) REFERENCES report_builders(id) ON DELETE CASCADE
);

-- Data Sources Table
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('database', 'api', 'file', 'calculated')),
    connection_config JSONB NOT NULL DEFAULT '{}',
    schema JSONB NOT NULL DEFAULT '{}',
    tables JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_data_sources_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Report Filters Table
CREATE TABLE IF NOT EXISTS report_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('date', 'number', 'text', 'select', 'multiselect', 'boolean')),
    field VARCHAR(255) NOT NULL,
    operator VARCHAR(50) NOT NULL,
    default_value JSONB,
    options JSONB NOT NULL DEFAULT '[]',
    required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_report_filters_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Report Executions Table (for tracking report runs)
CREATE TABLE IF NOT EXISTS report_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID NOT NULL,
    executed_by UUID NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    result JSONB,
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_report_executions_builder FOREIGN KEY (builder_id) REFERENCES report_builders(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_executions_executed_by FOREIGN KEY (executed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Report Shares Table (for sharing reports with specific users)
CREATE TABLE IF NOT EXISTS report_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID NOT NULL,
    shared_with UUID NOT NULL,
    permission VARCHAR(50) NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'admin')),
    shared_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_report_shares_builder FOREIGN KEY (builder_id) REFERENCES report_builders(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_shares_shared_with FOREIGN KEY (shared_with) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_shares_shared_by FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(builder_id, shared_with)
);

-- Report Schedules Table (for scheduled report generation)
CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    schedule_cron VARCHAR(255) NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}',
    export_format VARCHAR(50) NOT NULL DEFAULT 'pdf' CHECK (export_format IN ('pdf', 'excel', 'csv', 'json')),
    recipients JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_report_schedules_builder FOREIGN KEY (builder_id) REFERENCES report_builders(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_schedules_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Report Comments Table (for collaboration)
CREATE TABLE IF NOT EXISTS report_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID NOT NULL,
    element_id UUID,
    comment TEXT NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_report_comments_builder FOREIGN KEY (builder_id) REFERENCES report_builders(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_comments_element FOREIGN KEY (element_id) REFERENCES report_elements(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_comments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Report Versions Table (for version control)
CREATE TABLE IF NOT EXISTS report_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    name VARCHAR(255),
    description TEXT,
    layout JSONB NOT NULL DEFAULT '{}',
    elements JSONB NOT NULL DEFAULT '[]',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_report_versions_builder FOREIGN KEY (builder_id) REFERENCES report_builders(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_versions_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(builder_id, version_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_report_templates_company ON report_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_category ON report_templates(category);
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(type);
CREATE INDEX IF NOT EXISTS idx_report_templates_public ON report_templates(is_public);

CREATE INDEX IF NOT EXISTS idx_report_builders_company ON report_builders(company_id);
CREATE INDEX IF NOT EXISTS idx_report_builders_created_by ON report_builders(created_by);
CREATE INDEX IF NOT EXISTS idx_report_builders_public ON report_builders(is_public);

CREATE INDEX IF NOT EXISTS idx_report_elements_builder ON report_elements(builder_id);
CREATE INDEX IF NOT EXISTS idx_report_elements_type ON report_elements(type);

CREATE INDEX IF NOT EXISTS idx_data_sources_company ON data_sources(company_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_type ON data_sources(type);
CREATE INDEX IF NOT EXISTS idx_data_sources_active ON data_sources(is_active);

CREATE INDEX IF NOT EXISTS idx_report_filters_company ON report_filters(company_id);
CREATE INDEX IF NOT EXISTS idx_report_filters_type ON report_filters(type);

CREATE INDEX IF NOT EXISTS idx_report_executions_builder ON report_executions(builder_id);
CREATE INDEX IF NOT EXISTS idx_report_executions_executed_by ON report_executions(executed_by);
CREATE INDEX IF NOT EXISTS idx_report_executions_status ON report_executions(status);
CREATE INDEX IF NOT EXISTS idx_report_executions_created_at ON report_executions(created_at);

CREATE INDEX IF NOT EXISTS idx_report_shares_builder ON report_shares(builder_id);
CREATE INDEX IF NOT EXISTS idx_report_shares_shared_with ON report_shares(shared_with);

CREATE INDEX IF NOT EXISTS idx_report_schedules_builder ON report_schedules(builder_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_active ON report_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_run ON report_schedules(next_run);

CREATE INDEX IF NOT EXISTS idx_report_comments_builder ON report_comments(builder_id);
CREATE INDEX IF NOT EXISTS idx_report_comments_element ON report_comments(element_id);

CREATE INDEX IF NOT EXISTS idx_report_versions_builder ON report_versions(builder_id);
CREATE INDEX IF NOT EXISTS idx_report_versions_version ON report_versions(builder_id, version_number);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_builders_updated_at BEFORE UPDATE ON report_builders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_elements_updated_at BEFORE UPDATE ON report_elements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_filters_updated_at BEFORE UPDATE ON report_filters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_schedules_updated_at BEFORE UPDATE ON report_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_comments_updated_at BEFORE UPDATE ON report_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();





