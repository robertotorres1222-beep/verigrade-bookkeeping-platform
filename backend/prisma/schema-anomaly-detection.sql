-- Anomaly Detection Tables
-- This schema defines tables for storing anomaly detection data, alerts, and analysis results

-- Anomaly Detection Analysis Table
CREATE TABLE IF NOT EXISTS anomaly_detection_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL, -- 'financial', 'vendor', 'employee', 'transaction'
    analysis_data JSONB NOT NULL, -- Raw analysis data
    recommendations JSONB, -- Generated recommendations
    anomaly_score DECIMAL(5,2) DEFAULT 0, -- Overall anomaly score (0-100)
    confidence_score DECIMAL(5,2) DEFAULT 0, -- Confidence in the analysis (0-100)
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Anomaly Detections Table
CREATE TABLE IF NOT EXISTS anomaly_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES anomaly_detection_analyses(id) ON DELETE CASCADE,
    anomaly_type VARCHAR(50) NOT NULL, -- 'spending', 'revenue', 'cash_flow', 'transaction', 'vendor', 'employee'
    anomaly_subtype VARCHAR(100), -- More specific anomaly type
    severity VARCHAR(20) NOT NULL, -- 'critical', 'high', 'medium', 'low'
    description TEXT NOT NULL,
    detected_data JSONB NOT NULL, -- The data that triggered the anomaly
    anomaly_score DECIMAL(5,2) NOT NULL, -- Individual anomaly score
    confidence_score DECIMAL(5,2) NOT NULL, -- Confidence in this specific anomaly
    deviation_percentage DECIMAL(8,2), -- How much it deviates from normal
    baseline_data JSONB, -- Baseline data for comparison
    context_data JSONB, -- Additional context about the anomaly
    is_acknowledged BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Anomaly Alerts Table
CREATE TABLE IF NOT EXISTS anomaly_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    detection_id UUID REFERENCES anomaly_detections(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'financial', 'vendor', 'employee', 'transaction'
    severity VARCHAR(20) NOT NULL, -- 'critical', 'high', 'medium', 'low'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    alert_data JSONB NOT NULL, -- Alert-specific data
    is_acknowledged BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Anomaly Patterns Table
CREATE TABLE IF NOT EXISTS anomaly_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50) NOT NULL, -- 'spending', 'revenue', 'cash_flow', 'transaction'
    pattern_name VARCHAR(100) NOT NULL,
    pattern_description TEXT,
    pattern_data JSONB NOT NULL, -- Pattern definition and rules
    frequency_score DECIMAL(5,2) DEFAULT 0, -- How often this pattern occurs
    severity_score DECIMAL(5,2) DEFAULT 0, -- Severity of this pattern
    confidence_score DECIMAL(5,2) DEFAULT 0, -- Confidence in pattern detection
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Anomaly Rules Table
CREATE TABLE IF NOT EXISTS anomaly_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    rule_name VARCHAR(100) NOT NULL,
    rule_description TEXT,
    rule_type VARCHAR(50) NOT NULL, -- 'threshold', 'statistical', 'pattern', 'custom'
    rule_conditions JSONB NOT NULL, -- Rule conditions and logic
    severity VARCHAR(20) NOT NULL, -- 'critical', 'high', 'medium', 'low'
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Anomaly Thresholds Table
CREATE TABLE IF NOT EXISTS anomaly_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    threshold_type VARCHAR(50) NOT NULL, -- 'spending', 'revenue', 'cash_flow', 'transaction'
    threshold_name VARCHAR(100) NOT NULL,
    threshold_value DECIMAL(15,2) NOT NULL,
    threshold_percentage DECIMAL(5,2), -- Percentage threshold
    comparison_operator VARCHAR(10) NOT NULL, -- '>', '<', '>=', '<=', '=', '!='
    severity VARCHAR(20) NOT NULL, -- 'critical', 'high', 'medium', 'low'
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Anomaly Notifications Table
CREATE TABLE IF NOT EXISTS anomaly_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    alert_id UUID REFERENCES anomaly_alerts(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'webhook'
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    recipient_user_id UUID REFERENCES users(id),
    webhook_url TEXT,
    notification_data JSONB, -- Notification-specific data
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    is_delivered BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(50), -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Anomaly Reports Table
CREATE TABLE IF NOT EXISTS anomaly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
    report_name VARCHAR(100) NOT NULL,
    report_data JSONB NOT NULL, -- Report data and metrics
    report_file_path TEXT, -- Path to generated report file
    report_file_size INTEGER, -- File size in bytes
    is_generated BOOLEAN DEFAULT FALSE,
    generated_at TIMESTAMP WITH TIME ZONE,
    generated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_anomaly_detection_analyses_company_id ON anomaly_detection_analyses(company_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_detection_analyses_type ON anomaly_detection_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_anomaly_detection_analyses_analyzed_at ON anomaly_detection_analyses(analyzed_at);

CREATE INDEX IF NOT EXISTS idx_anomaly_detections_company_id ON anomaly_detections(company_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_detections_analysis_id ON anomaly_detections(analysis_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_detections_type ON anomaly_detections(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_anomaly_detections_severity ON anomaly_detections(severity);
CREATE INDEX IF NOT EXISTS idx_anomaly_detections_created_at ON anomaly_detections(created_at);
CREATE INDEX IF NOT EXISTS idx_anomaly_detections_acknowledged ON anomaly_detections(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_anomaly_detections_resolved ON anomaly_detections(is_resolved);

CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_company_id ON anomaly_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_detection_id ON anomaly_alerts(detection_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_type ON anomaly_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_severity ON anomaly_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_created_at ON anomaly_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_acknowledged ON anomaly_alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_resolved ON anomaly_alerts(is_resolved);

CREATE INDEX IF NOT EXISTS idx_anomaly_patterns_company_id ON anomaly_patterns(company_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_patterns_type ON anomaly_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_anomaly_patterns_active ON anomaly_patterns(is_active);

CREATE INDEX IF NOT EXISTS idx_anomaly_rules_company_id ON anomaly_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_rules_type ON anomaly_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_anomaly_rules_active ON anomaly_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_anomaly_thresholds_company_id ON anomaly_thresholds(company_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_thresholds_type ON anomaly_thresholds(threshold_type);
CREATE INDEX IF NOT EXISTS idx_anomaly_thresholds_active ON anomaly_thresholds(is_active);

CREATE INDEX IF NOT EXISTS idx_anomaly_notifications_company_id ON anomaly_notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_notifications_alert_id ON anomaly_notifications(alert_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_notifications_type ON anomaly_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_anomaly_notifications_sent ON anomaly_notifications(is_sent);
CREATE INDEX IF NOT EXISTS idx_anomaly_notifications_delivered ON anomaly_notifications(is_delivered);

CREATE INDEX IF NOT EXISTS idx_anomaly_reports_company_id ON anomaly_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_reports_type ON anomaly_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_anomaly_reports_generated ON anomaly_reports(is_generated);
CREATE INDEX IF NOT EXISTS idx_anomaly_reports_created_at ON anomaly_reports(created_at);

-- Add foreign key constraints
ALTER TABLE anomaly_detections ADD CONSTRAINT fk_anomaly_detections_acknowledged_by 
    FOREIGN KEY (acknowledged_by) REFERENCES users(id);
ALTER TABLE anomaly_detections ADD CONSTRAINT fk_anomaly_detections_resolved_by 
    FOREIGN KEY (resolved_by) REFERENCES users(id);

ALTER TABLE anomaly_alerts ADD CONSTRAINT fk_anomaly_alerts_acknowledged_by 
    FOREIGN KEY (acknowledged_by) REFERENCES users(id);
ALTER TABLE anomaly_alerts ADD CONSTRAINT fk_anomaly_alerts_resolved_by 
    FOREIGN KEY (resolved_by) REFERENCES users(id);

ALTER TABLE anomaly_rules ADD CONSTRAINT fk_anomaly_rules_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE anomaly_thresholds ADD CONSTRAINT fk_anomaly_thresholds_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE anomaly_notifications ADD CONSTRAINT fk_anomaly_notifications_user 
    FOREIGN KEY (recipient_user_id) REFERENCES users(id);

ALTER TABLE anomaly_reports ADD CONSTRAINT fk_anomaly_reports_generated_by 
    FOREIGN KEY (generated_by) REFERENCES users(id);




