-- Business Intelligence Database Schema
-- This schema supports advanced reporting, dashboards, KPIs, and analytics

-- BI Reports table
CREATE TABLE bi_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('dashboard', 'report', 'analysis')),
    data JSONB NOT NULL,
    filters JSONB,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BI Dashboards table
CREATE TABLE bi_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    layout JSONB NOT NULL,
    filters JSONB,
    refresh_interval INTEGER DEFAULT 300, -- seconds
    is_public BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BI Dashboard Widgets table
CREATE TABLE bi_dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES bi_dashboards(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('chart', 'table', 'metric', 'kpi', 'gauge', 'map')),
    title VARCHAR(200) NOT NULL,
    data_source VARCHAR(100) NOT NULL,
    query TEXT NOT NULL,
    config JSONB NOT NULL,
    position JSONB NOT NULL, -- {x, y, width, height}
    refresh_interval INTEGER DEFAULT 300, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BI Analyses table
CREATE TABLE bi_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('trend', 'comparison', 'correlation', 'forecast', 'segmentation')),
    data JSONB NOT NULL,
    insights TEXT[],
    recommendations TEXT[],
    confidence DECIMAL(5,4), -- 0.0000 to 1.0000
    methodology TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BI KPIs table
CREATE TABLE bi_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    target DECIMAL(15,2),
    unit VARCHAR(20) NOT NULL,
    trend VARCHAR(10) NOT NULL CHECK (trend IN ('up', 'down', 'stable')),
    change_percentage DECIMAL(5,2),
    status VARCHAR(20) NOT NULL CHECK (status IN ('on-track', 'at-risk', 'behind')),
    category VARCHAR(50) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BI Alerts table
CREATE TABLE bi_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    condition TEXT NOT NULL,
    threshold DECIMAL(15,2) NOT NULL,
    operator VARCHAR(5) NOT NULL CHECK (operator IN ('>', '<', '=', '>=', '<=', '!=')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    message TEXT NOT NULL,
    action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BI Query Cache table
CREATE TABLE bi_query_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    query_hash VARCHAR(64) NOT NULL,
    query_text TEXT NOT NULL,
    parameters JSONB,
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- BI User Preferences table
CREATE TABLE bi_user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BI Report Subscriptions table
CREATE TABLE bi_report_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES bi_reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    delivery_frequency VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BI Dashboard Sharing table
CREATE TABLE bi_dashboard_sharing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES bi_dashboards(id) ON DELETE CASCADE,
    shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shared_with_email VARCHAR(255),
    permission_level VARCHAR(20) NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BI Data Sources table
CREATE TABLE bi_data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL, -- database, api, file, etc.
    connection_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BI Scheduled Reports table
CREATE TABLE bi_scheduled_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES bi_reports(id) ON DELETE CASCADE,
    schedule_cron VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_generated TIMESTAMP WITH TIME ZONE,
    next_generation TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BI Report Generation History table
CREATE TABLE bi_report_generation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES bi_reports(id) ON DELETE CASCADE,
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    generation_type VARCHAR(20) NOT NULL CHECK (generation_type IN ('manual', 'scheduled', 'api')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_path VARCHAR(500),
    file_size BIGINT,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_bi_reports_company_category ON bi_reports(company_id, category);
CREATE INDEX idx_bi_reports_company_type ON bi_reports(company_id, type);
CREATE INDEX idx_bi_reports_created_by ON bi_reports(created_by);
CREATE INDEX idx_bi_reports_public ON bi_reports(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_bi_dashboards_company ON bi_dashboards(company_id);
CREATE INDEX idx_bi_dashboards_created_by ON bi_dashboards(created_by);
CREATE INDEX idx_bi_dashboard_widgets_dashboard ON bi_dashboard_widgets(dashboard_id);
CREATE INDEX idx_bi_analyses_company_type ON bi_analyses(company_id, type);
CREATE INDEX idx_bi_analyses_created_at ON bi_analyses(created_at);
CREATE INDEX idx_bi_kpis_company_category ON bi_kpis(company_id, category);
CREATE INDEX idx_bi_kpis_company_status ON bi_kpis(company_id, status);
CREATE INDEX idx_bi_kpis_last_updated ON bi_kpis(last_updated);
CREATE INDEX idx_bi_alerts_company_active ON bi_alerts(company_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_bi_alerts_severity ON bi_alerts(severity);
CREATE INDEX idx_bi_alerts_last_triggered ON bi_alerts(last_triggered);
CREATE INDEX idx_bi_query_cache_company_hash ON bi_query_cache(company_id, query_hash);
CREATE INDEX idx_bi_query_cache_expires ON bi_query_cache(expires_at);
CREATE INDEX idx_bi_user_preferences_user_company ON bi_user_preferences(user_id, company_id);
CREATE INDEX idx_bi_report_subscriptions_report ON bi_report_subscriptions(report_id);
CREATE INDEX idx_bi_report_subscriptions_user ON bi_report_subscriptions(user_id);
CREATE INDEX idx_bi_dashboard_sharing_dashboard ON bi_dashboard_sharing(dashboard_id);
CREATE INDEX idx_bi_dashboard_sharing_shared_with ON bi_dashboard_sharing(shared_with_user_id);
CREATE INDEX idx_bi_data_sources_company_active ON bi_data_sources(company_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_bi_scheduled_reports_report ON bi_scheduled_reports(report_id);
CREATE INDEX idx_bi_scheduled_reports_active ON bi_scheduled_reports(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_bi_scheduled_reports_next_generation ON bi_scheduled_reports(next_generation);
CREATE INDEX idx_bi_report_generation_history_report ON bi_report_generation_history(report_id);
CREATE INDEX idx_bi_report_generation_history_status ON bi_report_generation_history(status);
CREATE INDEX idx_bi_report_generation_history_started_at ON bi_report_generation_history(started_at);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bi_reports_updated_at 
    BEFORE UPDATE ON bi_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bi_dashboards_updated_at 
    BEFORE UPDATE ON bi_dashboards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bi_dashboard_widgets_updated_at 
    BEFORE UPDATE ON bi_dashboard_widgets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bi_alerts_updated_at 
    BEFORE UPDATE ON bi_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bi_user_preferences_updated_at 
    BEFORE UPDATE ON bi_user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bi_data_sources_updated_at 
    BEFORE UPDATE ON bi_data_sources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bi_scheduled_reports_updated_at 
    BEFORE UPDATE ON bi_scheduled_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common BI queries
CREATE VIEW bi_report_summary AS
SELECT 
    br.company_id,
    br.category,
    br.type,
    COUNT(*) as report_count,
    COUNT(CASE WHEN br.is_public = TRUE THEN 1 END) as public_reports,
    MAX(br.created_at) as latest_report,
    COUNT(DISTINCT br.created_by) as unique_creators
FROM bi_reports br
GROUP BY br.company_id, br.category, br.type;

CREATE VIEW bi_dashboard_summary AS
SELECT 
    bd.company_id,
    COUNT(*) as dashboard_count,
    COUNT(CASE WHEN bd.is_public = TRUE THEN 1 END) as public_dashboards,
    AVG(JSONB_ARRAY_LENGTH(bd.layout->'widgets')) as avg_widgets_per_dashboard,
    MAX(bd.created_at) as latest_dashboard
FROM bi_dashboards bd
GROUP BY bd.company_id;

CREATE VIEW bi_kpi_summary AS
SELECT 
    bk.company_id,
    bk.category,
    COUNT(*) as kpi_count,
    AVG(bk.value) as avg_value,
    AVG(bk.target) as avg_target,
    COUNT(CASE WHEN bk.status = 'on-track' THEN 1 END) as on_track_count,
    COUNT(CASE WHEN bk.status = 'at-risk' THEN 1 END) as at_risk_count,
    COUNT(CASE WHEN bk.status = 'behind' THEN 1 END) as behind_count
FROM bi_kpis bk
GROUP BY bk.company_id, bk.category;

CREATE VIEW bi_alert_summary AS
SELECT 
    ba.company_id,
    ba.severity,
    COUNT(*) as alert_count,
    COUNT(CASE WHEN ba.is_active = TRUE THEN 1 END) as active_alerts,
    COUNT(CASE WHEN ba.last_triggered IS NOT NULL THEN 1 END) as triggered_alerts,
    MAX(ba.last_triggered) as last_triggered
FROM bi_alerts ba
GROUP BY ba.company_id, ba.severity;

-- Create materialized views for complex BI analytics
CREATE MATERIALIZED VIEW bi_performance_metrics AS
SELECT 
    br.company_id,
    DATE_TRUNC('day', br.created_at) as date,
    COUNT(*) as reports_created,
    COUNT(CASE WHEN br.type = 'dashboard' THEN 1 END) as dashboards_created,
    COUNT(CASE WHEN br.type = 'report' THEN 1 END) as reports_generated,
    COUNT(CASE WHEN br.type = 'analysis' THEN 1 END) as analyses_created
FROM bi_reports br
GROUP BY br.company_id, DATE_TRUNC('day', br.created_at)
ORDER BY br.company_id, date;

-- Create index on materialized view
CREATE INDEX idx_bi_performance_metrics_company_date ON bi_performance_metrics(company_id, date);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO verigrade_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO verigrade_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO verigrade_app;




