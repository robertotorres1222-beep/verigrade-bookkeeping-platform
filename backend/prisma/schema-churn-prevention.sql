-- Predictive Churn Prevention Schema
-- This schema implements comprehensive churn prevention and customer retention analytics

-- Create churn prevention analysis table
CREATE TABLE IF NOT EXISTS churn_prevention_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL, -- 'customer_analysis', 'behavior_analysis', 'engagement_analysis', 'risk_factors'
    analysis_data JSONB NOT NULL, -- Detailed analysis results
    recommendations JSONB, -- Generated recommendations
    churn_risk_score INTEGER DEFAULT 0, -- Churn risk score 0-100
    confidence_score DECIMAL(5,2) DEFAULT 0, -- Confidence score 0-100
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create churn prevention recommendations table
CREATE TABLE IF NOT EXISTS churn_prevention_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL, -- 'customer_retention', 'behavior_intervention', 'engagement_boost', 'risk_mitigation'
    priority VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    action_required TEXT NOT NULL,
    expected_impact VARCHAR(100),
    confidence_score DECIMAL(5,2) DEFAULT 0,
    is_implemented BOOLEAN DEFAULT FALSE,
    implemented_at TIMESTAMP WITH TIME ZONE,
    implemented_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create churn prevention alerts table
CREATE TABLE IF NOT EXISTS churn_prevention_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'churn_risk', 'customer_retention', 'engagement', 'behavior'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    action_required TEXT,
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

-- Create customer churn risk table
CREATE TABLE IF NOT EXISTS customer_churn_risk (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    risk_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    risk_score INTEGER DEFAULT 0, -- Risk score 0-100
    risk_factors JSONB, -- Identified risk factors
    last_activity_date TIMESTAMP WITH TIME ZONE,
    days_since_last_activity INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    avg_transaction_value DECIMAL(10,2) DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0,
    behavior_score DECIMAL(5,2) DEFAULT 0,
    retention_probability DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, customer_id)
);

-- Create customer engagement metrics table
CREATE TABLE IF NOT EXISTS customer_engagement_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    engagement_level VARCHAR(20) NOT NULL, -- 'disengaged', 'low_engagement', 'moderate_engagement', 'high_engagement'
    engagement_score DECIMAL(5,2) DEFAULT 0, -- Engagement score 0-100
    last_activity_date TIMESTAMP WITH TIME ZONE,
    days_since_last_activity INTEGER DEFAULT 0,
    recent_transactions INTEGER DEFAULT 0,
    quarterly_transactions INTEGER DEFAULT 0,
    yearly_transactions INTEGER DEFAULT 0,
    customer_age_days INTEGER DEFAULT 0,
    lifecycle_stage VARCHAR(20), -- 'new_active', 'mature_inactive', 'old_inactive', 'normal'
    engagement_trend VARCHAR(20), -- 'increasing', 'stable', 'decreasing'
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create customer behavior patterns table
CREATE TABLE IF NOT EXISTS customer_behavior_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    behavior_risk_level VARCHAR(20) NOT NULL, -- 'low_risk', 'medium_risk', 'high_risk', 'stable'
    behavior_score DECIMAL(5,2) DEFAULT 0, -- Behavior score 0-100
    transaction_frequency VARCHAR(20), -- 'very_frequent', 'frequent', 'moderate', 'infrequent'
    spending_volatility VARCHAR(20), -- 'low_volatility', 'medium_volatility', 'high_volatility'
    large_transaction_pattern VARCHAR(20), -- 'low_large_transactions', 'medium_large_transactions', 'high_large_transactions'
    avg_days_between_transactions DECIMAL(10,2) DEFAULT 0,
    transaction_volatility DECIMAL(15,2) DEFAULT 0,
    behavior_trend VARCHAR(20), -- 'improving', 'stable', 'declining'
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create churn prevention campaigns table
CREATE TABLE IF NOT EXISTS churn_prevention_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(50) NOT NULL, -- 'retention', 're_engagement', 'win_back', 'loyalty'
    target_segment VARCHAR(50) NOT NULL, -- 'high_risk', 'medium_risk', 'disengaged', 'high_value'
    campaign_status VARCHAR(20) NOT NULL, -- 'draft', 'active', 'paused', 'completed', 'cancelled'
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    target_customers INTEGER DEFAULT 0,
    reached_customers INTEGER DEFAULT 0,
    engaged_customers INTEGER DEFAULT 0,
    converted_customers INTEGER DEFAULT 0,
    campaign_budget DECIMAL(12,2) DEFAULT 0,
    campaign_cost DECIMAL(12,2) DEFAULT 0,
    roi_percentage DECIMAL(5,2) DEFAULT 0,
    campaign_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create churn prevention metrics table
CREATE TABLE IF NOT EXISTS churn_prevention_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'churn_rate', 'retention_rate', 'engagement_rate', 'revenue_retention'
    metric_value DECIMAL(10,2) NOT NULL,
    benchmark_value DECIMAL(10,2),
    performance_score INTEGER DEFAULT 0, -- Performance score 0-100
    trend_direction VARCHAR(20), -- 'up', 'down', 'stable'
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create churn prevention feedback table
CREATE TABLE IF NOT EXISTS churn_prevention_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    feedback_type VARCHAR(50) NOT NULL, -- 'retention_effort', 'engagement_activity', 'campaign_response', 'general'
    feedback_rating INTEGER NOT NULL, -- 1-5 rating
    feedback_text TEXT,
    is_helpful BOOLEAN,
    retention_impact VARCHAR(20), -- 'positive', 'neutral', 'negative'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_churn_prevention_analyses_company ON churn_prevention_analyses(company_id);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_analyses_type ON churn_prevention_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_analyses_score ON churn_prevention_analyses(churn_risk_score);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_analyses_analyzed_at ON churn_prevention_analyses(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_recommendations_company ON churn_prevention_recommendations(company_id);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_recommendations_type ON churn_prevention_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_recommendations_priority ON churn_prevention_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_recommendations_implemented ON churn_prevention_recommendations(is_implemented);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_alerts_company ON churn_prevention_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_alerts_type ON churn_prevention_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_alerts_severity ON churn_prevention_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_alerts_acknowledged ON churn_prevention_alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_alerts_resolved ON churn_prevention_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_alerts_created_at ON churn_prevention_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_churn_risk_company ON customer_churn_risk(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_churn_risk_customer ON customer_churn_risk(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_churn_risk_level ON customer_churn_risk(risk_level);
CREATE INDEX IF NOT EXISTS idx_customer_churn_risk_score ON customer_churn_risk(risk_score);
CREATE INDEX IF NOT EXISTS idx_customer_churn_risk_updated_at ON customer_churn_risk(updated_at);
CREATE INDEX IF NOT EXISTS idx_customer_engagement_metrics_company ON customer_engagement_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_engagement_metrics_customer ON customer_engagement_metrics(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_engagement_metrics_level ON customer_engagement_metrics(engagement_level);
CREATE INDEX IF NOT EXISTS idx_customer_engagement_metrics_score ON customer_engagement_metrics(engagement_score);
CREATE INDEX IF NOT EXISTS idx_customer_engagement_metrics_measured_at ON customer_engagement_metrics(measured_at);
CREATE INDEX IF NOT EXISTS idx_customer_behavior_patterns_company ON customer_behavior_patterns(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_behavior_patterns_customer ON customer_behavior_patterns(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_behavior_patterns_risk ON customer_behavior_patterns(behavior_risk_level);
CREATE INDEX IF NOT EXISTS idx_customer_behavior_patterns_score ON customer_behavior_patterns(behavior_score);
CREATE INDEX IF NOT EXISTS idx_customer_behavior_patterns_measured_at ON customer_behavior_patterns(measured_at);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_campaigns_company ON churn_prevention_campaigns(company_id);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_campaigns_type ON churn_prevention_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_campaigns_segment ON churn_prevention_campaigns(target_segment);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_campaigns_status ON churn_prevention_campaigns(campaign_status);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_campaigns_created_at ON churn_prevention_campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_metrics_company ON churn_prevention_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_metrics_type ON churn_prevention_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_metrics_name ON churn_prevention_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_metrics_measured_at ON churn_prevention_metrics(measured_at);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_feedback_company ON churn_prevention_feedback(company_id);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_feedback_customer ON churn_prevention_feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_feedback_type ON churn_prevention_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_feedback_rating ON churn_prevention_feedback(feedback_rating);
CREATE INDEX IF NOT EXISTS idx_churn_prevention_feedback_created_at ON churn_prevention_feedback(created_at);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_churn_risk_updated_at BEFORE UPDATE ON customer_churn_risk FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE OR REPLACE VIEW churn_prevention_summary AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(cpa.id) as total_analyses,
    COUNT(CASE WHEN cpa.analysis_type = 'customer_analysis' THEN 1 END) as customer_analyses,
    COUNT(CASE WHEN cpa.analysis_type = 'behavior_analysis' THEN 1 END) as behavior_analyses,
    COUNT(CASE WHEN cpa.analysis_type = 'engagement_analysis' THEN 1 END) as engagement_analyses,
    COUNT(CASE WHEN cpa.analysis_type = 'risk_factors' THEN 1 END) as risk_factor_analyses,
    AVG(cpa.churn_risk_score) as avg_churn_risk_score,
    AVG(cpa.confidence_score) as avg_confidence_score,
    MAX(cpa.analyzed_at) as last_analysis_date
FROM companies c
LEFT JOIN churn_prevention_analyses cpa ON c.id = cpa.company_id
WHERE cpa.analyzed_at >= CURRENT_DATE - INTERVAL '30 days' OR cpa.analyzed_at IS NULL
GROUP BY c.id, c.name;

CREATE OR REPLACE VIEW customer_churn_risk_summary AS
SELECT 
    company_id,
    COUNT(*) as total_customers,
    COUNT(CASE WHEN risk_level = 'critical' THEN 1 END) as critical_risk_customers,
    COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_customers,
    COUNT(CASE WHEN risk_level = 'medium' THEN 1 END) as medium_risk_customers,
    COUNT(CASE WHEN risk_level = 'low' THEN 1 END) as low_risk_customers,
    AVG(risk_score) as avg_risk_score,
    AVG(engagement_score) as avg_engagement_score,
    AVG(behavior_score) as avg_behavior_score,
    AVG(retention_probability) as avg_retention_probability
FROM customer_churn_risk
WHERE updated_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY company_id;

CREATE OR REPLACE VIEW churn_prevention_recommendations_summary AS
SELECT 
    company_id,
    COUNT(*) as total_recommendations,
    COUNT(CASE WHEN recommendation_type = 'customer_retention' THEN 1 END) as customer_retention_recommendations,
    COUNT(CASE WHEN recommendation_type = 'behavior_intervention' THEN 1 END) as behavior_intervention_recommendations,
    COUNT(CASE WHEN recommendation_type = 'engagement_boost' THEN 1 END) as engagement_boost_recommendations,
    COUNT(CASE WHEN recommendation_type = 'risk_mitigation' THEN 1 END) as risk_mitigation_recommendations,
    COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical_recommendations,
    COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_recommendations,
    COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_recommendations,
    COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_recommendations,
    COUNT(CASE WHEN is_implemented THEN 1 END) as implemented_recommendations,
    COUNT(CASE WHEN NOT is_implemented THEN 1 END) as pending_recommendations,
    AVG(confidence_score) as avg_confidence_score
FROM churn_prevention_recommendations
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY company_id;

CREATE OR REPLACE VIEW churn_prevention_alerts_summary AS
SELECT 
    company_id,
    COUNT(*) as total_alerts,
    COUNT(CASE WHEN alert_type = 'churn_risk' THEN 1 END) as churn_risk_alerts,
    COUNT(CASE WHEN alert_type = 'customer_retention' THEN 1 END) as customer_retention_alerts,
    COUNT(CASE WHEN alert_type = 'engagement' THEN 1 END) as engagement_alerts,
    COUNT(CASE WHEN alert_type = 'behavior' THEN 1 END) as behavior_alerts,
    COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_alerts,
    COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_severity_alerts,
    COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_severity_alerts,
    COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_severity_alerts,
    COUNT(CASE WHEN is_acknowledged THEN 1 END) as acknowledged_alerts,
    COUNT(CASE WHEN is_resolved THEN 1 END) as resolved_alerts,
    COUNT(CASE WHEN NOT is_acknowledged AND NOT is_resolved THEN 1 END) as active_alerts
FROM churn_prevention_alerts
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY company_id;

-- Create function to calculate churn rate
CREATE OR REPLACE FUNCTION calculate_churn_rate(
    company_uuid UUID,
    period_days INTEGER DEFAULT 30
)
RETURNS TABLE(
    churn_rate DECIMAL(5,2),
    retention_rate DECIMAL(5,2),
    revenue_churn_rate DECIMAL(5,2),
    revenue_retention_rate DECIMAL(5,2)
) AS $$
DECLARE
    total_customers INTEGER;
    churned_customers INTEGER;
    total_revenue DECIMAL(15,2);
    churned_revenue DECIMAL(15,2);
    churn_rate DECIMAL(5,2);
    retention_rate DECIMAL(5,2);
    revenue_churn_rate DECIMAL(5,2);
    revenue_retention_rate DECIMAL(5,2);
BEGIN
    -- Get total customers at start of period
    SELECT COUNT(*)
    INTO total_customers
    FROM customers
    WHERE company_id = company_uuid
    AND created_at <= CURRENT_DATE - INTERVAL '1 day' * period_days;
    
    -- Get churned customers (no activity in period)
    SELECT COUNT(*)
    INTO churned_customers
    FROM customers
    WHERE company_id = company_uuid
    AND last_activity < CURRENT_DATE - INTERVAL '1 day' * period_days
    AND created_at <= CURRENT_DATE - INTERVAL '1 day' * period_days;
    
    -- Get total revenue at start of period
    SELECT COALESCE(SUM(amount), 0)
    INTO total_revenue
    FROM transactions
    WHERE company_id = company_uuid
    AND created_at <= CURRENT_DATE - INTERVAL '1 day' * period_days;
    
    -- Get churned revenue
    SELECT COALESCE(SUM(amount), 0)
    INTO churned_revenue
    FROM transactions t
    JOIN customers c ON t.customer_id = c.id
    WHERE t.company_id = company_uuid
    AND c.last_activity < CURRENT_DATE - INTERVAL '1 day' * period_days
    AND t.created_at <= CURRENT_DATE - INTERVAL '1 day' * period_days;
    
    -- Calculate rates
    churn_rate := CASE 
        WHEN total_customers > 0 THEN (churned_customers::DECIMAL / total_customers) * 100
        ELSE 0
    END;
    
    retention_rate := 100 - churn_rate;
    
    revenue_churn_rate := CASE 
        WHEN total_revenue > 0 THEN (churned_revenue / total_revenue) * 100
        ELSE 0
    END;
    
    revenue_retention_rate := 100 - revenue_churn_rate;
    
    RETURN QUERY SELECT churn_rate, retention_rate, revenue_churn_rate, revenue_retention_rate;
END;
$$ LANGUAGE plpgsql;

-- Create function to identify at-risk customers
CREATE OR REPLACE FUNCTION identify_at_risk_customers(
    company_uuid UUID,
    risk_threshold INTEGER DEFAULT 70
)
RETURNS TABLE(
    customer_id UUID,
    customer_name VARCHAR(255),
    risk_score INTEGER,
    risk_level VARCHAR(20),
    days_since_last_activity INTEGER,
    total_spent DECIMAL(15,2),
    engagement_score DECIMAL(5,2),
    behavior_score DECIMAL(5,2),
    retention_probability DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ccr.customer_id,
        c.name as customer_name,
        ccr.risk_score,
        ccr.risk_level,
        ccr.days_since_last_activity,
        ccr.total_spent,
        ccr.engagement_score,
        ccr.behavior_score,
        ccr.retention_probability
    FROM customer_churn_risk ccr
    JOIN customers c ON ccr.customer_id = c.id
    WHERE ccr.company_id = company_uuid
    AND ccr.risk_score >= risk_threshold
    ORDER BY ccr.risk_score DESC, ccr.total_spent DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate churn prevention recommendations
CREATE OR REPLACE FUNCTION generate_churn_prevention_recommendations(
    company_uuid UUID
)
RETURNS TABLE(
    recommendation_type VARCHAR(50),
    priority VARCHAR(20),
    title VARCHAR(255),
    description TEXT,
    action_required TEXT,
    expected_impact VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    WITH risk_analysis AS (
        SELECT 
            COUNT(*) as total_customers,
            COUNT(CASE WHEN risk_level = 'critical' THEN 1 END) as critical_customers,
            COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_customers,
            COUNT(CASE WHEN engagement_level = 'disengaged' THEN 1 END) as disengaged_customers,
            COUNT(CASE WHEN behavior_risk_level = 'high_risk' THEN 1 END) as high_behavior_risk_customers
        FROM customer_churn_risk ccr
        LEFT JOIN customer_engagement_metrics cem ON ccr.customer_id = cem.customer_id
        LEFT JOIN customer_behavior_patterns cbp ON ccr.customer_id = cbp.customer_id
        WHERE ccr.company_id = company_uuid
    )
    SELECT 
        'customer_retention' as recommendation_type,
        'high' as priority,
        'Retain High-Risk Customers' as title,
        'Focus on retaining customers with high churn risk' as description,
        'Implement immediate retention strategies for high-risk customers' as action_required,
        'High - will prevent revenue loss' as expected_impact
    FROM risk_analysis
    WHERE critical_customers > 0
    
    UNION ALL
    
    SELECT 
        'engagement_boost' as recommendation_type,
        'medium' as priority,
        'Re-engage Disengaged Customers' as title,
        'Launch campaigns to re-engage disengaged customers' as description,
        'Implement re-engagement campaigns and improve customer experience' as action_required,
        'Medium - will improve customer engagement' as expected_impact
    FROM risk_analysis
    WHERE disengaged_customers > 0
    
    UNION ALL
    
    SELECT 
        'behavior_intervention' as recommendation_type,
        'medium' as priority,
        'Address High-Risk Behavior Patterns' as title,
        'Implement strategies to address concerning behavior patterns' as description,
        'Develop behavior-based retention strategies' as action_required,
        'Medium - will improve customer behavior' as expected_impact
    FROM risk_analysis
    WHERE high_behavior_risk_customers > 0;
END;
$$ LANGUAGE plpgsql;





