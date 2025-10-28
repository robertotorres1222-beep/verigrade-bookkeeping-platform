-- Advanced Analytics Database Schema
-- This schema supports comprehensive analytics, reporting, and business intelligence

-- Analytics metrics cache table
CREATE TABLE analytics_metrics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    period VARCHAR(20) NOT NULL,
    data JSONB NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time series data storage
CREATE TABLE analytics_time_series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    date_period DATE NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cohort analysis data
CREATE TABLE analytics_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    cohort_period DATE NOT NULL,
    period_number INTEGER NOT NULL,
    customer_count INTEGER NOT NULL,
    revenue DECIMAL(15,2) NOT NULL,
    retention_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictive insights storage
CREATE TABLE analytics_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL,
    forecast_period VARCHAR(20) NOT NULL,
    predicted_value DECIMAL(15,2) NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    model_version VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business intelligence KPIs
CREATE TABLE analytics_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    kpi_name VARCHAR(100) NOT NULL,
    current_value DECIMAL(15,2) NOT NULL,
    target_value DECIMAL(15,2),
    status VARCHAR(20) NOT NULL CHECK (status IN ('on-track', 'at-risk', 'behind')),
    trend VARCHAR(10) NOT NULL CHECK (trend IN ('up', 'down', 'stable')),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics alerts
CREATE TABLE analytics_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    action_required TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics recommendations
CREATE TABLE analytics_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    impact_level VARCHAR(20) NOT NULL CHECK (impact_level IN ('high', 'medium', 'low')),
    effort_level VARCHAR(20) NOT NULL CHECK (effort_level IN ('high', 'medium', 'low')),
    estimated_roi DECIMAL(5,2),
    is_implemented BOOLEAN DEFAULT FALSE,
    implemented_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom analytics queries
CREATE TABLE analytics_custom_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query_name VARCHAR(200) NOT NULL,
    query_sql TEXT NOT NULL,
    parameters JSONB,
    is_public BOOLEAN DEFAULT FALSE,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics dashboards
CREATE TABLE analytics_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dashboard_name VARCHAR(200) NOT NULL,
    description TEXT,
    layout_config JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard widgets
CREATE TABLE analytics_dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
    widget_type VARCHAR(50) NOT NULL,
    widget_config JSONB NOT NULL,
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics reports
CREATE TABLE analytics_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_name VARCHAR(200) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    report_config JSONB NOT NULL,
    schedule_cron VARCHAR(100),
    is_automated BOOLEAN DEFAULT FALSE,
    last_generated_at TIMESTAMP WITH TIME ZONE,
    next_generation_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report subscriptions
CREATE TABLE analytics_report_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES analytics_reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    delivery_frequency VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics data exports
CREATE TABLE analytics_data_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL,
    export_format VARCHAR(20) NOT NULL,
    filters JSONB,
    file_path VARCHAR(500),
    file_size BIGINT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Analytics performance metrics
CREATE TABLE analytics_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    query_type VARCHAR(50) NOT NULL,
    execution_time_ms INTEGER NOT NULL,
    cache_hit BOOLEAN DEFAULT FALSE,
    data_points INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_analytics_metrics_cache_company_period ON analytics_metrics_cache(company_id, period);
CREATE INDEX idx_analytics_metrics_cache_expires ON analytics_metrics_cache(expires_at);
CREATE INDEX idx_analytics_time_series_company_metric ON analytics_time_series(company_id, metric_name);
CREATE INDEX idx_analytics_time_series_date ON analytics_time_series(date_period);
CREATE INDEX idx_analytics_cohorts_company_period ON analytics_cohorts(company_id, cohort_period);
CREATE INDEX idx_analytics_predictions_company_type ON analytics_predictions(company_id, prediction_type);
CREATE INDEX idx_analytics_kpis_company_status ON analytics_kpis(company_id, status);
CREATE INDEX idx_analytics_alerts_company_severity ON analytics_alerts(company_id, severity);
CREATE INDEX idx_analytics_alerts_unresolved ON analytics_alerts(company_id, is_resolved) WHERE is_resolved = FALSE;
CREATE INDEX idx_analytics_recommendations_company_impact ON analytics_recommendations(company_id, impact_level);
CREATE INDEX idx_analytics_custom_queries_company_user ON analytics_custom_queries(company_id, user_id);
CREATE INDEX idx_analytics_dashboards_company_user ON analytics_dashboards(company_id, user_id);
CREATE INDEX idx_analytics_reports_company_schedule ON analytics_reports(company_id, is_automated, next_generation_at);
CREATE INDEX idx_analytics_exports_company_status ON analytics_data_exports(company_id, status);
CREATE INDEX idx_analytics_performance_company_type ON analytics_performance_metrics(company_id, query_type);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analytics_metrics_cache_updated_at 
    BEFORE UPDATE ON analytics_metrics_cache 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_custom_queries_updated_at 
    BEFORE UPDATE ON analytics_custom_queries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_dashboards_updated_at 
    BEFORE UPDATE ON analytics_dashboards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_dashboard_widgets_updated_at 
    BEFORE UPDATE ON analytics_dashboard_widgets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_reports_updated_at 
    BEFORE UPDATE ON analytics_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common analytics queries
CREATE VIEW analytics_revenue_summary AS
SELECT 
    company_id,
    DATE_TRUNC('month', created_at) as month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as revenue,
    COUNT(DISTINCT customer_id) as customers,
    AVG(CASE WHEN type = 'income' THEN amount ELSE 0 END) as avg_order_value
FROM transactions
GROUP BY company_id, DATE_TRUNC('month', created_at);

CREATE VIEW analytics_expense_summary AS
SELECT 
    company_id,
    DATE_TRUNC('month', created_at) as month,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
    COUNT(*) as transaction_count,
    AVG(amount) as avg_expense
FROM transactions
WHERE type = 'expense'
GROUP BY company_id, DATE_TRUNC('month', created_at);

CREATE VIEW analytics_customer_metrics AS
SELECT 
    company_id,
    COUNT(*) as total_customers,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_customers_30d,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '90 days' THEN 1 END) as new_customers_90d,
    AVG(customer_lifetime_value) as avg_lifetime_value
FROM customers
GROUP BY company_id;

-- Create materialized views for complex analytics
CREATE MATERIALIZED VIEW analytics_monthly_trends AS
SELECT 
    company_id,
    DATE_TRUNC('month', created_at) as month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as revenue,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as profit,
    COUNT(DISTINCT customer_id) as active_customers,
    COUNT(*) as total_transactions
FROM transactions
GROUP BY company_id, DATE_TRUNC('month', created_at)
ORDER BY company_id, month;

-- Create index on materialized view
CREATE INDEX idx_analytics_monthly_trends_company_month ON analytics_monthly_trends(company_id, month);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO verigrade_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO verigrade_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO verigrade_app;








