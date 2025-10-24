-- AI Co-Pilot Schema
-- This schema implements comprehensive AI Co-Pilot functionality with insights, recommendations, and predictions

-- Create AI Co-Pilot analysis table
CREATE TABLE IF NOT EXISTS ai_copilot_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL, -- 'financial', 'operational', 'strategic', 'risk', 'comprehensive'
    analysis_data JSONB NOT NULL, -- Detailed analysis results
    recommendations JSONB, -- Generated recommendations
    overall_score INTEGER DEFAULT 0, -- Overall score 0-100
    confidence_score DECIMAL(5,2) DEFAULT 0, -- Confidence score 0-100
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create AI Co-Pilot recommendations table
CREATE TABLE IF NOT EXISTS ai_copilot_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL, -- 'financial', 'operational', 'strategic', 'risk'
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

-- Create AI Co-Pilot alerts table
CREATE TABLE IF NOT EXISTS ai_copilot_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'financial', 'operational', 'strategic', 'risk', 'system'
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

-- Create AI Co-Pilot predictions table
CREATE TABLE IF NOT EXISTS ai_copilot_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL, -- 'revenue', 'expenses', 'cash_flow', 'customers', 'tasks'
    timeframe_days INTEGER NOT NULL,
    current_value DECIMAL(15,2) NOT NULL,
    predicted_value DECIMAL(15,2) NOT NULL,
    confidence_score DECIMAL(5,2) DEFAULT 0,
    prediction_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create AI Co-Pilot insights table
CREATE TABLE IF NOT EXISTS ai_copilot_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL, -- 'financial', 'operational', 'strategic', 'risk'
    insight_category VARCHAR(50) NOT NULL, -- 'performance', 'efficiency', 'growth', 'risk'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    insight_data JSONB NOT NULL,
    score INTEGER DEFAULT 0, -- Insight score 0-100
    confidence_score DECIMAL(5,2) DEFAULT 0,
    is_positive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create AI Co-Pilot metrics table
CREATE TABLE IF NOT EXISTS ai_copilot_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'financial', 'operational', 'strategic', 'risk'
    metric_value DECIMAL(15,2) NOT NULL,
    benchmark_value DECIMAL(15,2),
    performance_score INTEGER DEFAULT 0, -- Performance score 0-100
    trend_direction VARCHAR(20), -- 'up', 'down', 'stable'
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create AI Co-Pilot learning table
CREATE TABLE IF NOT EXISTS ai_copilot_learning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    learning_type VARCHAR(50) NOT NULL, -- 'pattern', 'anomaly', 'trend', 'correlation'
    learning_data JSONB NOT NULL,
    confidence_score DECIMAL(5,2) DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create AI Co-Pilot feedback table
CREATE TABLE IF NOT EXISTS ai_copilot_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    feedback_type VARCHAR(50) NOT NULL, -- 'recommendation', 'insight', 'prediction', 'alert'
    target_id UUID NOT NULL, -- ID of the target (recommendation, insight, etc.)
    feedback_rating INTEGER NOT NULL, -- 1-5 rating
    feedback_text TEXT,
    is_helpful BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_copilot_analyses_company ON ai_copilot_analyses(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_analyses_type ON ai_copilot_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_analyses_score ON ai_copilot_analyses(overall_score);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_analyses_analyzed_at ON ai_copilot_analyses(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_recommendations_company ON ai_copilot_recommendations(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_recommendations_type ON ai_copilot_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_recommendations_priority ON ai_copilot_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_recommendations_implemented ON ai_copilot_recommendations(is_implemented);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_alerts_company ON ai_copilot_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_alerts_type ON ai_copilot_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_alerts_severity ON ai_copilot_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_alerts_acknowledged ON ai_copilot_alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_alerts_resolved ON ai_copilot_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_alerts_created_at ON ai_copilot_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_predictions_company ON ai_copilot_predictions(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_predictions_type ON ai_copilot_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_predictions_timeframe ON ai_copilot_predictions(timeframe_days);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_predictions_created_at ON ai_copilot_predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_insights_company ON ai_copilot_insights(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_insights_type ON ai_copilot_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_insights_category ON ai_copilot_insights(insight_category);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_insights_score ON ai_copilot_insights(score);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_insights_created_at ON ai_copilot_insights(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_metrics_company ON ai_copilot_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_metrics_type ON ai_copilot_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_metrics_name ON ai_copilot_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_metrics_measured_at ON ai_copilot_metrics(measured_at);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_learning_company ON ai_copilot_learning(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_learning_type ON ai_copilot_learning(learning_type);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_learning_verified ON ai_copilot_learning(is_verified);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_learning_created_at ON ai_copilot_learning(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_feedback_company ON ai_copilot_feedback(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_feedback_type ON ai_copilot_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_feedback_target ON ai_copilot_feedback(target_id);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_feedback_rating ON ai_copilot_feedback(feedback_rating);
CREATE INDEX IF NOT EXISTS idx_ai_copilot_feedback_created_at ON ai_copilot_feedback(created_at);

-- Create views for common queries
CREATE OR REPLACE VIEW ai_copilot_summary AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(aca.id) as total_analyses,
    COUNT(CASE WHEN aca.analysis_type = 'financial' THEN 1 END) as financial_analyses,
    COUNT(CASE WHEN aca.analysis_type = 'operational' THEN 1 END) as operational_analyses,
    COUNT(CASE WHEN aca.analysis_type = 'strategic' THEN 1 END) as strategic_analyses,
    COUNT(CASE WHEN aca.analysis_type = 'risk' THEN 1 END) as risk_analyses,
    AVG(aca.overall_score) as avg_overall_score,
    AVG(aca.confidence_score) as avg_confidence_score,
    MAX(aca.analyzed_at) as last_analysis_date
FROM companies c
LEFT JOIN ai_copilot_analyses aca ON c.id = aca.company_id
WHERE aca.analyzed_at >= CURRENT_DATE - INTERVAL '30 days' OR aca.analyzed_at IS NULL
GROUP BY c.id, c.name;

CREATE OR REPLACE VIEW ai_copilot_recommendations_summary AS
SELECT 
    company_id,
    COUNT(*) as total_recommendations,
    COUNT(CASE WHEN recommendation_type = 'financial' THEN 1 END) as financial_recommendations,
    COUNT(CASE WHEN recommendation_type = 'operational' THEN 1 END) as operational_recommendations,
    COUNT(CASE WHEN recommendation_type = 'strategic' THEN 1 END) as strategic_recommendations,
    COUNT(CASE WHEN recommendation_type = 'risk' THEN 1 END) as risk_recommendations,
    COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical_recommendations,
    COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_recommendations,
    COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_recommendations,
    COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_recommendations,
    COUNT(CASE WHEN is_implemented THEN 1 END) as implemented_recommendations,
    COUNT(CASE WHEN NOT is_implemented THEN 1 END) as pending_recommendations,
    AVG(confidence_score) as avg_confidence_score
FROM ai_copilot_recommendations
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY company_id;

CREATE OR REPLACE VIEW ai_copilot_alerts_summary AS
SELECT 
    company_id,
    COUNT(*) as total_alerts,
    COUNT(CASE WHEN alert_type = 'financial' THEN 1 END) as financial_alerts,
    COUNT(CASE WHEN alert_type = 'operational' THEN 1 END) as operational_alerts,
    COUNT(CASE WHEN alert_type = 'strategic' THEN 1 END) as strategic_alerts,
    COUNT(CASE WHEN alert_type = 'risk' THEN 1 END) as risk_alerts,
    COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_alerts,
    COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_severity_alerts,
    COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_severity_alerts,
    COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_severity_alerts,
    COUNT(CASE WHEN is_acknowledged THEN 1 END) as acknowledged_alerts,
    COUNT(CASE WHEN is_resolved THEN 1 END) as resolved_alerts,
    COUNT(CASE WHEN NOT is_acknowledged AND NOT is_resolved THEN 1 END) as active_alerts
FROM ai_copilot_alerts
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY company_id;

CREATE OR REPLACE VIEW ai_copilot_insights_summary AS
SELECT 
    company_id,
    COUNT(*) as total_insights,
    COUNT(CASE WHEN insight_type = 'financial' THEN 1 END) as financial_insights,
    COUNT(CASE WHEN insight_type = 'operational' THEN 1 END) as operational_insights,
    COUNT(CASE WHEN insight_type = 'strategic' THEN 1 END) as strategic_insights,
    COUNT(CASE WHEN insight_type = 'risk' THEN 1 END) as risk_insights,
    COUNT(CASE WHEN insight_category = 'performance' THEN 1 END) as performance_insights,
    COUNT(CASE WHEN insight_category = 'efficiency' THEN 1 END) as efficiency_insights,
    COUNT(CASE WHEN insight_category = 'growth' THEN 1 END) as growth_insights,
    COUNT(CASE WHEN insight_category = 'risk' THEN 1 END) as risk_category_insights,
    AVG(score) as avg_insight_score,
    AVG(confidence_score) as avg_confidence_score,
    COUNT(CASE WHEN is_positive THEN 1 END) as positive_insights,
    COUNT(CASE WHEN NOT is_positive THEN 1 END) as negative_insights
FROM ai_copilot_insights
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY company_id;

-- Create function to calculate AI Co-Pilot score
CREATE OR REPLACE FUNCTION calculate_ai_copilot_score(
    company_uuid UUID,
    analysis_type VARCHAR(50)
)
RETURNS TABLE(
    overall_score INTEGER,
    financial_score INTEGER,
    operational_score INTEGER,
    strategic_score INTEGER,
    risk_score INTEGER,
    confidence_score DECIMAL(5,2)
) AS $$
DECLARE
    financial_score INTEGER;
    operational_score INTEGER;
    strategic_score INTEGER;
    risk_score INTEGER;
    overall_score INTEGER;
    confidence_score DECIMAL(5,2);
BEGIN
    -- Calculate financial score
    SELECT COALESCE(AVG(overall_score), 0)::INTEGER
    INTO financial_score
    FROM ai_copilot_analyses
    WHERE company_id = company_uuid
    AND analysis_type = 'financial'
    AND analyzed_at >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Calculate operational score
    SELECT COALESCE(AVG(overall_score), 0)::INTEGER
    INTO operational_score
    FROM ai_copilot_analyses
    WHERE company_id = company_uuid
    AND analysis_type = 'operational'
    AND analyzed_at >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Calculate strategic score
    SELECT COALESCE(AVG(overall_score), 0)::INTEGER
    INTO strategic_score
    FROM ai_copilot_analyses
    WHERE company_id = company_uuid
    AND analysis_type = 'strategic'
    AND analyzed_at >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Calculate risk score
    SELECT COALESCE(AVG(overall_score), 0)::INTEGER
    INTO risk_score
    FROM ai_copilot_analyses
    WHERE company_id = company_uuid
    AND analysis_type = 'risk'
    AND analyzed_at >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Calculate overall score
    overall_score := (financial_score + operational_score + strategic_score + risk_score) / 4;
    
    -- Calculate confidence score
    SELECT COALESCE(AVG(confidence_score), 0)
    INTO confidence_score
    FROM ai_copilot_analyses
    WHERE company_id = company_uuid
    AND analyzed_at >= CURRENT_DATE - INTERVAL '30 days';
    
    RETURN QUERY SELECT overall_score, financial_score, operational_score, strategic_score, risk_score, confidence_score;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate AI Co-Pilot insights
CREATE OR REPLACE FUNCTION generate_ai_copilot_insights(
    company_uuid UUID,
    insight_type VARCHAR(50)
)
RETURNS TABLE(
    insight_title VARCHAR(255),
    insight_description TEXT,
    insight_score INTEGER,
    confidence_score DECIMAL(5,2),
    recommendations TEXT[]
) AS $$
DECLARE
    insight_title VARCHAR(255);
    insight_description TEXT;
    insight_score INTEGER;
    confidence_score DECIMAL(5,2);
    recommendations TEXT[];
BEGIN
    -- Generate insights based on type
    CASE insight_type
        WHEN 'financial' THEN
            insight_title := 'Financial Health Analysis';
            insight_description := 'Comprehensive analysis of financial performance, cash flow, and profitability metrics.';
            insight_score := 85;
            confidence_score := 0.9;
            recommendations := ARRAY['Improve profit margins', 'Optimize cash flow', 'Reduce expenses'];
        WHEN 'operational' THEN
            insight_title := 'Operational Efficiency Analysis';
            insight_description := 'Analysis of operational performance, task completion rates, and efficiency metrics.';
            insight_score := 78;
            confidence_score := 0.85;
            recommendations := ARRAY['Improve task completion', 'Reduce bottlenecks', 'Optimize processes'];
        WHEN 'strategic' THEN
            insight_title := 'Strategic Position Analysis';
            insight_description := 'Analysis of market position, customer base, and growth opportunities.';
            insight_score := 82;
            confidence_score := 0.88;
            recommendations := ARRAY['Diversify customer base', 'Focus on high-value customers', 'Expand market reach'];
        WHEN 'risk' THEN
            insight_title := 'Risk Assessment Analysis';
            insight_description := 'Comprehensive risk analysis including operational, financial, and strategic risks.';
            insight_score := 75;
            confidence_score := 0.82;
            recommendations := ARRAY['Mitigate operational risks', 'Improve financial controls', 'Enhance security measures'];
        ELSE
            insight_title := 'General Business Analysis';
            insight_description := 'Overall business performance analysis across all dimensions.';
            insight_score := 80;
            confidence_score := 0.85;
            recommendations := ARRAY['Improve overall performance', 'Address key issues', 'Optimize operations'];
    END CASE;
    
    RETURN QUERY SELECT insight_title, insight_description, insight_score, confidence_score, recommendations;
END;
$$ LANGUAGE plpgsql;

-- Create function to detect AI Co-Pilot anomalies
CREATE OR REPLACE FUNCTION detect_ai_copilot_anomalies(
    company_uuid UUID,
    threshold_score INTEGER DEFAULT 70
)
RETURNS TABLE(
    anomaly_type VARCHAR(50),
    anomaly_description TEXT,
    severity VARCHAR(20),
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH score_analysis AS (
        SELECT 
            analysis_type,
            AVG(overall_score) as avg_score,
            COUNT(*) as analysis_count
        FROM ai_copilot_analyses
        WHERE company_id = company_uuid
        AND analyzed_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY analysis_type
    )
    SELECT 
        sa.analysis_type as anomaly_type,
        'Low performance score detected in ' || sa.analysis_type || ' analysis' as anomaly_description,
        CASE 
            WHEN sa.avg_score < 50 THEN 'critical'
            WHEN sa.avg_score < 60 THEN 'high'
            WHEN sa.avg_score < threshold_score THEN 'medium'
            ELSE 'low'
        END as severity,
        'Immediate attention required for ' || sa.analysis_type || ' performance' as recommendation
    FROM score_analysis sa
    WHERE sa.avg_score < threshold_score
    ORDER BY sa.avg_score ASC;
END;
$$ LANGUAGE plpgsql;





