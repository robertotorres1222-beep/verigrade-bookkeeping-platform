-- Advanced Fraud Detection Schema
-- This schema implements comprehensive fraud detection capabilities

-- Create fraud detections table
CREATE TABLE IF NOT EXISTS fraud_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    fraud_type VARCHAR(50) NOT NULL, -- 'ghost_employee', 'split_transaction', 'duplicate_invoice', 'round_number_transaction', 'suspicious_vendor'
    entity_type VARCHAR(50) NOT NULL, -- 'employee', 'transaction', 'invoice', 'vendor'
    entity_id UUID NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    description TEXT NOT NULL,
    fraud_data JSONB NOT NULL, -- Detailed fraud data
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolution_type VARCHAR(50) -- 'false_positive', 'confirmed_fraud', 'investigation_complete'
);

-- Create ghost employee reports table
CREATE TABLE IF NOT EXISTS ghost_employee_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(255) NOT NULL,
    employee_email VARCHAR(255),
    department VARCHAR(100),
    position VARCHAR(100),
    salary DECIMAL(12,2),
    hire_date DATE,
    activity_status VARCHAR(50) NOT NULL, -- 'no_activity', 'minimal_activity', 'inactive_90_days', 'inactive_180_days'
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    total_expenses DECIMAL(12,2) DEFAULT 0,
    total_hours DECIMAL(8,2) DEFAULT 0,
    expense_count INTEGER DEFAULT 0,
    timesheet_count INTEGER DEFAULT 0,
    communication_count INTEGER DEFAULT 0,
    project_count INTEGER DEFAULT 0,
    task_count INTEGER DEFAULT 0,
    last_expense TIMESTAMP WITH TIME ZONE,
    last_timesheet TIMESTAMP WITH TIME ZONE,
    last_communication TIMESTAMP WITH TIME ZONE,
    last_project TIMESTAMP WITH TIME ZONE,
    last_task TIMESTAMP WITH TIME ZONE,
    recommendations JSONB,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolution_type VARCHAR(50)
);

-- Create Benford analysis table
CREATE TABLE IF NOT EXISTS benford_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL, -- 'transactions', 'expenses', 'invoices', 'payments'
    total_records INTEGER NOT NULL,
    benford_distribution JSONB NOT NULL, -- Expected Benford distribution
    actual_distribution JSONB NOT NULL, -- Actual first digit distribution
    chi_square_statistic DECIMAL(10,4) NOT NULL,
    p_value DECIMAL(10,6) NOT NULL,
    is_significant BOOLEAN NOT NULL,
    anomalies JSONB, -- Detected anomalies
    confidence_level DECIMAL(3,2) DEFAULT 0.95,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create fraud detection analytics table
CREATE TABLE IF NOT EXISTS fraud_detection_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_detections INTEGER DEFAULT 0,
    ghost_employee_detections INTEGER DEFAULT 0,
    split_transaction_detections INTEGER DEFAULT 0,
    duplicate_invoice_detections INTEGER DEFAULT 0,
    round_number_detections INTEGER DEFAULT 0,
    suspicious_vendor_detections INTEGER DEFAULT 0,
    high_risk_detections INTEGER DEFAULT 0,
    medium_risk_detections INTEGER DEFAULT 0,
    low_risk_detections INTEGER DEFAULT 0,
    resolved_detections INTEGER DEFAULT 0,
    unresolved_detections INTEGER DEFAULT 0,
    avg_risk_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, date)
);

-- Create fraud detection alerts table
CREATE TABLE IF NOT EXISTS fraud_detection_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'high_risk_detection', 'multiple_detections', 'trend_anomaly'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    fraud_type VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id UUID,
    alert_data JSONB,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create fraud detection rules table
CREATE TABLE IF NOT EXISTS fraud_detection_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- 'ghost_employee', 'split_transaction', 'duplicate_invoice', 'round_number', 'suspicious_vendor'
    rule_config JSONB NOT NULL, -- Rule configuration parameters
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create fraud detection thresholds table
CREATE TABLE IF NOT EXISTS fraud_detection_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    fraud_type VARCHAR(50) NOT NULL,
    threshold_name VARCHAR(100) NOT NULL,
    threshold_value DECIMAL(10,4) NOT NULL,
    threshold_unit VARCHAR(20), -- 'percentage', 'count', 'amount', 'days'
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, fraud_type, threshold_name)
);

-- Create fraud detection reports table
CREATE TABLE IF NOT EXISTS fraud_detection_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- 'summary', 'detailed', 'trend', 'anomaly'
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    report_data JSONB NOT NULL,
    generated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    file_path TEXT,
    file_size_bytes BIGINT,
    download_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fraud_detections_company ON fraud_detections(company_id);
CREATE INDEX IF NOT EXISTS idx_fraud_detections_type ON fraud_detections(fraud_type);
CREATE INDEX IF NOT EXISTS idx_fraud_detections_entity ON fraud_detections(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_fraud_detections_severity ON fraud_detections(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_detections_resolved ON fraud_detections(is_resolved);
CREATE INDEX IF NOT EXISTS idx_fraud_detections_detected_at ON fraud_detections(detected_at);
CREATE INDEX IF NOT EXISTS idx_ghost_employee_reports_company ON ghost_employee_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_ghost_employee_reports_employee ON ghost_employee_reports(employee_id);
CREATE INDEX IF NOT EXISTS idx_ghost_employee_reports_status ON ghost_employee_reports(activity_status);
CREATE INDEX IF NOT EXISTS idx_ghost_employee_reports_risk ON ghost_employee_reports(risk_score);
CREATE INDEX IF NOT EXISTS idx_ghost_employee_reports_resolved ON ghost_employee_reports(is_resolved);
CREATE INDEX IF NOT EXISTS idx_ghost_employee_reports_detected_at ON ghost_employee_reports(detected_at);
CREATE INDEX IF NOT EXISTS idx_benford_analyses_company ON benford_analyses(company_id);
CREATE INDEX IF NOT EXISTS idx_benford_analyses_type ON benford_analyses(data_type);
CREATE INDEX IF NOT EXISTS idx_benford_analyses_significant ON benford_analyses(is_significant);
CREATE INDEX IF NOT EXISTS idx_benford_analyses_analyzed_at ON benford_analyses(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_analytics_company ON fraud_detection_analytics(company_id);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_analytics_date ON fraud_detection_analytics(date);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_alerts_company ON fraud_detection_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_alerts_type ON fraud_detection_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_alerts_severity ON fraud_detection_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_alerts_acknowledged ON fraud_detection_alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_alerts_resolved ON fraud_detection_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_alerts_created_at ON fraud_detection_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_rules_company ON fraud_detection_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_rules_type ON fraud_detection_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_rules_active ON fraud_detection_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_thresholds_company ON fraud_detection_thresholds(company_id);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_thresholds_type ON fraud_detection_thresholds(fraud_type);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_thresholds_active ON fraud_detection_thresholds(is_active);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_reports_company ON fraud_detection_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_reports_type ON fraud_detection_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_reports_period ON fraud_detection_reports(report_period_start, report_period_end);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_reports_generated_at ON fraud_detection_reports(generated_at);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fraud_detection_analytics_updated_at BEFORE UPDATE ON fraud_detection_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fraud_detection_rules_updated_at BEFORE UPDATE ON fraud_detection_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fraud_detection_thresholds_updated_at BEFORE UPDATE ON fraud_detection_thresholds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE OR REPLACE VIEW fraud_detection_summary AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(fd.id) as total_detections,
    COUNT(CASE WHEN fd.fraud_type = 'ghost_employee' THEN 1 END) as ghost_employee_detections,
    COUNT(CASE WHEN fd.fraud_type = 'split_transaction' THEN 1 END) as split_transaction_detections,
    COUNT(CASE WHEN fd.fraud_type = 'duplicate_invoice' THEN 1 END) as duplicate_invoice_detections,
    COUNT(CASE WHEN fd.fraud_type = 'round_number_transaction' THEN 1 END) as round_number_detections,
    COUNT(CASE WHEN fd.fraud_type = 'suspicious_vendor' THEN 1 END) as suspicious_vendor_detections,
    COUNT(CASE WHEN fd.severity = 'high' THEN 1 END) as high_risk_detections,
    COUNT(CASE WHEN fd.severity = 'medium' THEN 1 END) as medium_risk_detections,
    COUNT(CASE WHEN fd.severity = 'low' THEN 1 END) as low_risk_detections,
    COUNT(CASE WHEN fd.is_resolved THEN 1 END) as resolved_detections,
    COUNT(CASE WHEN NOT fd.is_resolved THEN 1 END) as unresolved_detections,
    MAX(fd.detected_at) as last_detection_date
FROM companies c
LEFT JOIN fraud_detections fd ON c.id = fd.company_id
WHERE fd.detected_at >= CURRENT_DATE - INTERVAL '30 days' OR fd.detected_at IS NULL
GROUP BY c.id, c.name;

CREATE OR REPLACE VIEW ghost_employee_summary AS
SELECT 
    company_id,
    COUNT(*) as total_ghost_employees,
    COUNT(CASE WHEN activity_status = 'no_activity' THEN 1 END) as no_activity_count,
    COUNT(CASE WHEN activity_status = 'minimal_activity' THEN 1 END) as minimal_activity_count,
    COUNT(CASE WHEN activity_status = 'inactive_90_days' THEN 1 END) as inactive_90_days_count,
    COUNT(CASE WHEN activity_status = 'inactive_180_days' THEN 1 END) as inactive_180_days_count,
    COUNT(CASE WHEN risk_score >= 80 THEN 1 END) as high_risk_count,
    COUNT(CASE WHEN risk_score >= 60 AND risk_score < 80 THEN 1 END) as medium_risk_count,
    COUNT(CASE WHEN risk_score < 60 THEN 1 END) as low_risk_count,
    COUNT(CASE WHEN is_resolved THEN 1 END) as resolved_count,
    COUNT(CASE WHEN NOT is_resolved THEN 1 END) as unresolved_count,
    AVG(risk_score) as avg_risk_score,
    SUM(salary) as total_salary_at_risk
FROM ghost_employee_reports
WHERE detected_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY company_id;

CREATE OR REPLACE VIEW benford_analysis_summary AS
SELECT 
    company_id,
    data_type,
    COUNT(*) as total_analyses,
    COUNT(CASE WHEN is_significant THEN 1 END) as significant_analyses,
    COUNT(CASE WHEN NOT is_significant THEN 1 END) as non_significant_analyses,
    AVG(chi_square_statistic) as avg_chi_square,
    AVG(p_value) as avg_p_value,
    MAX(analyzed_at) as last_analysis_date
FROM benford_analyses
WHERE analyzed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY company_id, data_type;

-- Create function to detect fraud patterns
CREATE OR REPLACE FUNCTION detect_fraud_patterns(company_uuid UUID)
RETURNS TABLE(
    pattern_type VARCHAR(50),
    pattern_count BIGINT,
    risk_level VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    WITH fraud_patterns AS (
        -- Ghost employee pattern
        SELECT 'ghost_employee' as pattern_type, COUNT(*) as pattern_count, 'high' as risk_level
        FROM ghost_employee_reports
        WHERE company_id = company_uuid
        AND is_resolved = FALSE
        AND risk_score >= 70
        
        UNION ALL
        
        -- Split transaction pattern
        SELECT 'split_transaction' as pattern_type, COUNT(*) as pattern_count, 'medium' as risk_level
        FROM fraud_detections
        WHERE company_id = company_uuid
        AND fraud_type = 'split_transaction'
        AND is_resolved = FALSE
        AND severity IN ('high', 'medium')
        
        UNION ALL
        
        -- Duplicate invoice pattern
        SELECT 'duplicate_invoice' as pattern_type, COUNT(*) as pattern_count, 'high' as risk_level
        FROM fraud_detections
        WHERE company_id = company_uuid
        AND fraud_type = 'duplicate_invoice'
        AND is_resolved = FALSE
        AND severity IN ('high', 'medium')
        
        UNION ALL
        
        -- Round number transaction pattern
        SELECT 'round_number_transaction' as pattern_type, COUNT(*) as pattern_count, 'low' as risk_level
        FROM fraud_detections
        WHERE company_id = company_uuid
        AND fraud_type = 'round_number_transaction'
        AND is_resolved = FALSE
        AND severity = 'high'
        
        UNION ALL
        
        -- Suspicious vendor pattern
        SELECT 'suspicious_vendor' as pattern_type, COUNT(*) as pattern_count, 'medium' as risk_level
        FROM fraud_detections
        WHERE company_id = company_uuid
        AND fraud_type = 'suspicious_vendor'
        AND is_resolved = FALSE
        AND severity IN ('high', 'medium')
    )
    SELECT 
        fp.pattern_type,
        fp.pattern_count,
        fp.risk_level
    FROM fraud_patterns fp
    WHERE fp.pattern_count > 0
    ORDER BY 
        CASE fp.risk_level
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 3
        END,
        fp.pattern_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate fraud risk score
CREATE OR REPLACE FUNCTION calculate_fraud_risk_score(company_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    risk_score INTEGER := 0;
    ghost_employee_count INTEGER;
    split_transaction_count INTEGER;
    duplicate_invoice_count INTEGER;
    round_number_count INTEGER;
    suspicious_vendor_count INTEGER;
BEGIN
    -- Count ghost employees
    SELECT COUNT(*) INTO ghost_employee_count
    FROM ghost_employee_reports
    WHERE company_id = company_uuid
    AND is_resolved = FALSE
    AND risk_score >= 70;
    
    -- Count split transactions
    SELECT COUNT(*) INTO split_transaction_count
    FROM fraud_detections
    WHERE company_id = company_uuid
    AND fraud_type = 'split_transaction'
    AND is_resolved = FALSE
    AND severity IN ('high', 'medium');
    
    -- Count duplicate invoices
    SELECT COUNT(*) INTO duplicate_invoice_count
    FROM fraud_detections
    WHERE company_id = company_uuid
    AND fraud_type = 'duplicate_invoice'
    AND is_resolved = FALSE
    AND severity IN ('high', 'medium');
    
    -- Count round number transactions
    SELECT COUNT(*) INTO round_number_count
    FROM fraud_detections
    WHERE company_id = company_uuid
    AND fraud_type = 'round_number_transaction'
    AND is_resolved = FALSE
    AND severity = 'high';
    
    -- Count suspicious vendors
    SELECT COUNT(*) INTO suspicious_vendor_count
    FROM fraud_detections
    WHERE company_id = company_uuid
    AND fraud_type = 'suspicious_vendor'
    AND is_resolved = FALSE
    AND severity IN ('high', 'medium');
    
    -- Calculate risk score
    risk_score := (ghost_employee_count * 20) + 
                  (split_transaction_count * 15) + 
                  (duplicate_invoice_count * 25) + 
                  (round_number_count * 10) + 
                  (suspicious_vendor_count * 15);
    
    -- Cap at 100
    IF risk_score > 100 THEN
        risk_score := 100;
    END IF;
    
    RETURN risk_score;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate fraud detection report
CREATE OR REPLACE FUNCTION generate_fraud_detection_report(
    company_uuid UUID,
    start_date DATE,
    end_date DATE
)
RETURNS TABLE(
    fraud_type VARCHAR(50),
    detection_count BIGINT,
    high_risk_count BIGINT,
    medium_risk_count BIGINT,
    low_risk_count BIGINT,
    resolved_count BIGINT,
    unresolved_count BIGINT,
    avg_risk_score DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fd.fraud_type,
        COUNT(*) as detection_count,
        COUNT(CASE WHEN fd.severity = 'high' THEN 1 END) as high_risk_count,
        COUNT(CASE WHEN fd.severity = 'medium' THEN 1 END) as medium_risk_count,
        COUNT(CASE WHEN fd.severity = 'low' THEN 1 END) as low_risk_count,
        COUNT(CASE WHEN fd.is_resolved THEN 1 END) as resolved_count,
        COUNT(CASE WHEN NOT fd.is_resolved THEN 1 END) as unresolved_count,
        AVG(CAST(fd.fraud_data->>'riskScore' AS DECIMAL)) as avg_risk_score
    FROM fraud_detections fd
    WHERE fd.company_id = company_uuid
    AND fd.detected_at BETWEEN start_date AND end_date
    GROUP BY fd.fraud_type
    ORDER BY detection_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert default fraud detection thresholds
INSERT INTO fraud_detection_thresholds (company_id, fraud_type, threshold_name, threshold_value, threshold_unit, created_by)
SELECT 
    c.id,
    'ghost_employee',
    'risk_score_threshold',
    70.0,
    'percentage',
    c.owner_id
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM fraud_detection_thresholds 
    WHERE company_id = c.id AND fraud_type = 'ghost_employee'
);

INSERT INTO fraud_detection_thresholds (company_id, fraud_type, threshold_name, threshold_value, threshold_unit, created_by)
SELECT 
    c.id,
    'split_transaction',
    'amount_threshold',
    800.0,
    'amount',
    c.owner_id
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM fraud_detection_thresholds 
    WHERE company_id = c.id AND fraud_type = 'split_transaction'
);

INSERT INTO fraud_detection_thresholds (company_id, fraud_type, threshold_name, threshold_value, threshold_unit, created_by)
SELECT 
    c.id,
    'round_number_transaction',
    'amount_threshold',
    5000.0,
    'amount',
    c.owner_id
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM fraud_detection_thresholds 
    WHERE company_id = c.id AND fraud_type = 'round_number_transaction'
);





