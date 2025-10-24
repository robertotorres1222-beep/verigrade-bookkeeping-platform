-- Advanced Monitoring Schema
-- This schema supports monitoring dashboards, SLOs, alerting, log analysis, and performance metrics

-- Monitoring Dashboards Table
CREATE TABLE IF NOT EXISTS monitoring_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    layout JSONB NOT NULL DEFAULT '{}',
    widgets JSONB NOT NULL DEFAULT '[]',
    filters JSONB NOT NULL DEFAULT '[]',
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_monitoring_dashboards_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_monitoring_dashboards_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- SLO Metrics Table
CREATE TABLE IF NOT EXISTS slo_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('availability', 'latency', 'error_rate', 'throughput', 'custom')),
    target DECIMAL(5,4) NOT NULL, -- Target value (0-1 for percentages, actual values for others)
    measurement DECIMAL(10,4) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical')),
    error_budget DECIMAL(10,4) NOT NULL DEFAULT 0,
    burn_rate DECIMAL(10,4) NOT NULL DEFAULT 0,
    time_window VARCHAR(20) NOT NULL DEFAULT '30d',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_slo_metrics_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Alert Rules Table
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    metric VARCHAR(255) NOT NULL,
    condition VARCHAR(50) NOT NULL CHECK (condition IN ('greater_than', 'less_than', 'equals', 'not_equals', 'contains', 'not_contains')),
    threshold DECIMAL(15,4) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    channels JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    cooldown INTEGER NOT NULL DEFAULT 300, -- Cooldown in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_alert_rules_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Log Queries Table
CREATE TABLE IF NOT EXISTS log_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    query TEXT NOT NULL,
    time_range VARCHAR(20) NOT NULL DEFAULT '1h',
    filters JSONB NOT NULL DEFAULT '[]',
    saved BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_log_queries_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_log_queries_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    service VARCHAR(100) NOT NULL,
    metric VARCHAR(255) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    tags JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_performance_metrics_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Custom Metrics Table
CREATE TABLE IF NOT EXISTS custom_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('counter', 'gauge', 'histogram', 'summary')),
    unit VARCHAR(50) NOT NULL,
    aggregation VARCHAR(50) NOT NULL CHECK (aggregation IN ('sum', 'avg', 'min', 'max', 'count', 'p95', 'p99')),
    tags JSONB NOT NULL DEFAULT '{}',
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_custom_metrics_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Alert History Table
CREATE TABLE IF NOT EXISTS alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    rule_id UUID NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('triggered', 'resolved', 'acknowledged', 'suppressed')),
    message TEXT,
    severity VARCHAR(20) NOT NULL,
    channels JSONB NOT NULL DEFAULT '[]',
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_alert_history_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_alert_history_rule FOREIGN KEY (rule_id) REFERENCES alert_rules(id) ON DELETE CASCADE,
    CONSTRAINT fk_alert_history_acknowledged_by FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Monitoring Widgets Table
CREATE TABLE IF NOT EXISTS monitoring_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('chart', 'metric', 'table', 'log', 'alert', 'slo')),
    title VARCHAR(255) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "w": 4, "h": 3}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_monitoring_widgets_dashboard FOREIGN KEY (dashboard_id) REFERENCES monitoring_dashboards(id) ON DELETE CASCADE
);

-- Log Aggregations Table
CREATE TABLE IF NOT EXISTS log_aggregations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    time_bucket TIMESTAMP WITH TIME ZONE NOT NULL,
    service VARCHAR(100) NOT NULL,
    level VARCHAR(20) NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_log_aggregations_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Metric Anomalies Table
CREATE TABLE IF NOT EXISTS metric_anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    service VARCHAR(100) NOT NULL,
    anomaly_type VARCHAR(50) NOT NULL CHECK (anomaly_type IN ('spike', 'drop', 'trend_change', 'seasonal_break')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    expected_value DECIMAL(15,4) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_metric_anomalies_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Monitoring Alerts Table
CREATE TABLE IF NOT EXISTS monitoring_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    query TEXT NOT NULL,
    threshold DECIMAL(15,4) NOT NULL,
    operator VARCHAR(10) NOT NULL CHECK (operator IN ('>', '<', '>=', '<=', '=', '!=')),
    duration VARCHAR(20) NOT NULL DEFAULT '5m',
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    channels JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_monitoring_alerts_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Monitoring Incidents Table
CREATE TABLE IF NOT EXISTS monitoring_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    assigned_to UUID,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_monitoring_incidents_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_monitoring_incidents_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_monitoring_incidents_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_monitoring_dashboards_company ON monitoring_dashboards(company_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_dashboards_created_by ON monitoring_dashboards(created_by);
CREATE INDEX IF NOT EXISTS idx_monitoring_dashboards_public ON monitoring_dashboards(is_public);

CREATE INDEX IF NOT EXISTS idx_slo_metrics_company ON slo_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_slo_metrics_type ON slo_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_slo_metrics_status ON slo_metrics(status);

CREATE INDEX IF NOT EXISTS idx_alert_rules_company ON alert_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_metric ON alert_rules(metric);
CREATE INDEX IF NOT EXISTS idx_alert_rules_active ON alert_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_alert_rules_severity ON alert_rules(severity);

CREATE INDEX IF NOT EXISTS idx_log_queries_company ON log_queries(company_id);
CREATE INDEX IF NOT EXISTS idx_log_queries_created_by ON log_queries(created_by);
CREATE INDEX IF NOT EXISTS idx_log_queries_saved ON log_queries(saved);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_company ON performance_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_service ON performance_metrics(service);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric ON performance_metrics(metric);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_custom_metrics_company ON custom_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_custom_metrics_type ON custom_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_custom_metrics_public ON custom_metrics(is_public);

CREATE INDEX IF NOT EXISTS idx_alert_history_company ON alert_history(company_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_rule ON alert_history(rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_status ON alert_history(status);
CREATE INDEX IF NOT EXISTS idx_alert_history_created_at ON alert_history(created_at);

CREATE INDEX IF NOT EXISTS idx_monitoring_widgets_dashboard ON monitoring_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_widgets_type ON monitoring_widgets(type);

CREATE INDEX IF NOT EXISTS idx_log_aggregations_company ON log_aggregations(company_id);
CREATE INDEX IF NOT EXISTS idx_log_aggregations_time_bucket ON log_aggregations(time_bucket);
CREATE INDEX IF NOT EXISTS idx_log_aggregations_service ON log_aggregations(service);

CREATE INDEX IF NOT EXISTS idx_metric_anomalies_company ON metric_anomalies(company_id);
CREATE INDEX IF NOT EXISTS idx_metric_anomalies_metric ON metric_anomalies(metric_name);
CREATE INDEX IF NOT EXISTS idx_metric_anomalies_detected_at ON metric_anomalies(detected_at);
CREATE INDEX IF NOT EXISTS idx_metric_anomalies_severity ON metric_anomalies(severity);

CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_company ON monitoring_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_active ON monitoring_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_severity ON monitoring_alerts(severity);

CREATE INDEX IF NOT EXISTS idx_monitoring_incidents_company ON monitoring_incidents(company_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_incidents_status ON monitoring_incidents(status);
CREATE INDEX IF NOT EXISTS idx_monitoring_incidents_severity ON monitoring_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_monitoring_incidents_assigned_to ON monitoring_incidents(assigned_to);
CREATE INDEX IF NOT EXISTS idx_monitoring_incidents_started_at ON monitoring_incidents(started_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_monitoring_dashboards_updated_at BEFORE UPDATE ON monitoring_dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slo_metrics_updated_at BEFORE UPDATE ON slo_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON alert_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_metrics_updated_at BEFORE UPDATE ON custom_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monitoring_widgets_updated_at BEFORE UPDATE ON monitoring_widgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monitoring_alerts_updated_at BEFORE UPDATE ON monitoring_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monitoring_incidents_updated_at BEFORE UPDATE ON monitoring_incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();




