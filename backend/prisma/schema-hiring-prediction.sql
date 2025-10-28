-- Predictive Hiring Model Schema
-- This schema implements comprehensive hiring prediction and bottleneck analysis

-- Create hiring analysis table
CREATE TABLE IF NOT EXISTS hiring_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL, -- 'hiring_needs', 'bottleneck_analysis', 'capacity_analysis', 'growth_projection'
    analysis_data JSONB NOT NULL, -- Detailed analysis results
    recommendations JSONB, -- Generated recommendations
    confidence_score DECIMAL(5,2) DEFAULT 0, -- Confidence score 0-100
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create bottleneck analysis table
CREATE TABLE IF NOT EXISTS bottleneck_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL, -- 'task_bottleneck', 'resource_bottleneck', 'process_bottleneck', 'capacity_bottleneck'
    analysis_data JSONB NOT NULL, -- Detailed bottleneck analysis
    recommendations JSONB, -- Generated recommendations
    bottleneck_score INTEGER DEFAULT 0, -- Overall bottleneck score 0-100
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create hiring scenarios table
CREATE TABLE IF NOT EXISTS hiring_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    scenario_name VARCHAR(100) NOT NULL,
    scenario_type VARCHAR(50) NOT NULL, -- 'immediate', 'delayed', 'gradual', 'conditional'
    description TEXT,
    timeline_days INTEGER NOT NULL,
    estimated_cost DECIMAL(12,2) NOT NULL,
    expected_benefits JSONB,
    risks JSONB,
    roi_projection DECIMAL(8,2),
    confidence_level DECIMAL(3,2) DEFAULT 0.8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create hiring triggers table
CREATE TABLE IF NOT EXISTS hiring_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    trigger_name VARCHAR(100) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL, -- 'bottleneck', 'capacity', 'growth', 'performance'
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    trigger_condition JSONB NOT NULL, -- Condition that triggers hiring
    threshold_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create hiring recommendations table
CREATE TABLE IF NOT EXISTS hiring_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL, -- 'urgent_hiring', 'capacity_hiring', 'growth_hiring', 'replacement_hiring'
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    priority VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reason TEXT NOT NULL,
    action_required TEXT NOT NULL,
    estimated_impact VARCHAR(100),
    estimated_cost DECIMAL(12,2),
    estimated_timeline_days INTEGER,
    confidence_score DECIMAL(5,2) DEFAULT 0,
    is_implemented BOOLEAN DEFAULT FALSE,
    implemented_at TIMESTAMP WITH TIME ZONE,
    implemented_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create hiring analytics table
CREATE TABLE IF NOT EXISTS hiring_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_employees INTEGER DEFAULT 0,
    new_hires INTEGER DEFAULT 0,
    departures INTEGER DEFAULT 0,
    net_hiring INTEGER DEFAULT 0,
    total_salary_cost DECIMAL(12,2) DEFAULT 0,
    avg_salary DECIMAL(10,2) DEFAULT 0,
    hiring_cost DECIMAL(12,2) DEFAULT 0,
    onboarding_cost DECIMAL(12,2) DEFAULT 0,
    total_hiring_cost DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, date)
);

-- Create bottleneck metrics table
CREATE TABLE IF NOT EXISTS bottleneck_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'task', 'resource', 'process', 'capacity'
    metric_value DECIMAL(10,2) NOT NULL,
    threshold_value DECIMAL(10,2) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create hiring forecasts table
CREATE TABLE IF NOT EXISTS hiring_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    forecast_type VARCHAR(50) NOT NULL, -- 'short_term', 'medium_term', 'long_term'
    forecast_period_months INTEGER NOT NULL,
    projected_headcount INTEGER NOT NULL,
    projected_salary_cost DECIMAL(12,2) NOT NULL,
    projected_hiring_cost DECIMAL(12,2) NOT NULL,
    confidence_level DECIMAL(3,2) DEFAULT 0.8,
    assumptions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create hiring alerts table
CREATE TABLE IF NOT EXISTS hiring_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'bottleneck_alert', 'capacity_alert', 'hiring_trigger', 'forecast_alert'
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hiring_analyses_company ON hiring_analyses(company_id);
CREATE INDEX IF NOT EXISTS idx_hiring_analyses_type ON hiring_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_hiring_analyses_analyzed_at ON hiring_analyses(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_bottleneck_analyses_company ON bottleneck_analyses(company_id);
CREATE INDEX IF NOT EXISTS idx_bottleneck_analyses_type ON bottleneck_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_bottleneck_analyses_score ON bottleneck_analyses(bottleneck_score);
CREATE INDEX IF NOT EXISTS idx_bottleneck_analyses_analyzed_at ON bottleneck_analyses(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_hiring_scenarios_company ON hiring_scenarios(company_id);
CREATE INDEX IF NOT EXISTS idx_hiring_scenarios_type ON hiring_scenarios(scenario_type);
CREATE INDEX IF NOT EXISTS idx_hiring_scenarios_timeline ON hiring_scenarios(timeline_days);
CREATE INDEX IF NOT EXISTS idx_hiring_triggers_company ON hiring_triggers(company_id);
CREATE INDEX IF NOT EXISTS idx_hiring_triggers_department ON hiring_triggers(department_id);
CREATE INDEX IF NOT EXISTS idx_hiring_triggers_type ON hiring_triggers(trigger_type);
CREATE INDEX IF NOT EXISTS idx_hiring_triggers_severity ON hiring_triggers(severity);
CREATE INDEX IF NOT EXISTS idx_hiring_triggers_active ON hiring_triggers(is_active);
CREATE INDEX IF NOT EXISTS idx_hiring_recommendations_company ON hiring_recommendations(company_id);
CREATE INDEX IF NOT EXISTS idx_hiring_recommendations_department ON hiring_recommendations(department_id);
CREATE INDEX IF NOT EXISTS idx_hiring_recommendations_type ON hiring_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_hiring_recommendations_priority ON hiring_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_hiring_recommendations_implemented ON hiring_recommendations(is_implemented);
CREATE INDEX IF NOT EXISTS idx_hiring_analytics_company ON hiring_analytics(company_id);
CREATE INDEX IF NOT EXISTS idx_hiring_analytics_date ON hiring_analytics(date);
CREATE INDEX IF NOT EXISTS idx_bottleneck_metrics_company ON bottleneck_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_bottleneck_metrics_department ON bottleneck_metrics(department_id);
CREATE INDEX IF NOT EXISTS idx_bottleneck_metrics_type ON bottleneck_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_bottleneck_metrics_severity ON bottleneck_metrics(severity);
CREATE INDEX IF NOT EXISTS idx_bottleneck_metrics_measured_at ON bottleneck_metrics(measured_at);
CREATE INDEX IF NOT EXISTS idx_hiring_forecasts_company ON hiring_forecasts(company_id);
CREATE INDEX IF NOT EXISTS idx_hiring_forecasts_type ON hiring_forecasts(forecast_type);
CREATE INDEX IF NOT EXISTS idx_hiring_forecasts_period ON hiring_forecasts(forecast_period_months);
CREATE INDEX IF NOT EXISTS idx_hiring_alerts_company ON hiring_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_hiring_alerts_department ON hiring_alerts(department_id);
CREATE INDEX IF NOT EXISTS idx_hiring_alerts_type ON hiring_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_hiring_alerts_severity ON hiring_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_hiring_alerts_acknowledged ON hiring_alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_hiring_alerts_resolved ON hiring_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_hiring_alerts_created_at ON hiring_alerts(created_at);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hiring_analytics_updated_at BEFORE UPDATE ON hiring_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE OR REPLACE VIEW hiring_summary AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(ha.id) as total_analyses,
    COUNT(CASE WHEN ha.analysis_type = 'hiring_needs' THEN 1 END) as hiring_needs_analyses,
    COUNT(CASE WHEN ha.analysis_type = 'bottleneck_analysis' THEN 1 END) as bottleneck_analyses,
    COUNT(CASE WHEN ha.analysis_type = 'capacity_analysis' THEN 1 END) as capacity_analyses,
    COUNT(CASE WHEN ha.analysis_type = 'growth_projection' THEN 1 END) as growth_projection_analyses,
    AVG(ha.confidence_score) as avg_confidence_score,
    MAX(ha.analyzed_at) as last_analysis_date
FROM companies c
LEFT JOIN hiring_analyses ha ON c.id = ha.company_id
WHERE ha.analyzed_at >= CURRENT_DATE - INTERVAL '30 days' OR ha.analyzed_at IS NULL
GROUP BY c.id, c.name;

CREATE OR REPLACE VIEW bottleneck_summary AS
SELECT 
    company_id,
    COUNT(*) as total_bottleneck_analyses,
    COUNT(CASE WHEN analysis_type = 'task_bottleneck' THEN 1 END) as task_bottleneck_analyses,
    COUNT(CASE WHEN analysis_type = 'resource_bottleneck' THEN 1 END) as resource_bottleneck_analyses,
    COUNT(CASE WHEN analysis_type = 'process_bottleneck' THEN 1 END) as process_bottleneck_analyses,
    COUNT(CASE WHEN analysis_type = 'capacity_bottleneck' THEN 1 END) as capacity_bottleneck_analyses,
    AVG(bottleneck_score) as avg_bottleneck_score,
    MAX(analyzed_at) as last_analysis_date
FROM bottleneck_analyses
WHERE analyzed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY company_id;

CREATE OR REPLACE VIEW hiring_recommendations_summary AS
SELECT 
    company_id,
    COUNT(*) as total_recommendations,
    COUNT(CASE WHEN recommendation_type = 'urgent_hiring' THEN 1 END) as urgent_hiring_recommendations,
    COUNT(CASE WHEN recommendation_type = 'capacity_hiring' THEN 1 END) as capacity_hiring_recommendations,
    COUNT(CASE WHEN recommendation_type = 'growth_hiring' THEN 1 END) as growth_hiring_recommendations,
    COUNT(CASE WHEN recommendation_type = 'replacement_hiring' THEN 1 END) as replacement_hiring_recommendations,
    COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical_recommendations,
    COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_recommendations,
    COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_recommendations,
    COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_recommendations,
    COUNT(CASE WHEN is_implemented THEN 1 END) as implemented_recommendations,
    COUNT(CASE WHEN NOT is_implemented THEN 1 END) as pending_recommendations,
    AVG(confidence_score) as avg_confidence_score
FROM hiring_recommendations
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY company_id;

-- Create function to calculate hiring ROI
CREATE OR REPLACE FUNCTION calculate_hiring_roi(
    company_uuid UUID,
    department_uuid UUID,
    new_employee_count INTEGER,
    avg_salary DECIMAL(10,2)
)
RETURNS TABLE(
    total_cost DECIMAL(12,2),
    expected_revenue_increase DECIMAL(12,2),
    roi_percentage DECIMAL(5,2),
    payback_period_months INTEGER
) AS $$
DECLARE
    hiring_cost DECIMAL(12,2);
    onboarding_cost DECIMAL(12,2);
    total_salary_cost DECIMAL(12,2);
    revenue_per_employee DECIMAL(12,2);
    expected_revenue DECIMAL(12,2);
    roi DECIMAL(5,2);
    payback_months INTEGER;
BEGIN
    -- Calculate costs
    hiring_cost := new_employee_count * avg_salary * 0.3; -- 30% of salary for hiring
    onboarding_cost := new_employee_count * avg_salary * 0.1; -- 10% for onboarding
    total_salary_cost := new_employee_count * avg_salary * 12; -- Annual salary
    total_cost := hiring_cost + onboarding_cost + total_salary_cost;
    
    -- Get revenue per employee from historical data
    SELECT COALESCE(AVG(department_revenue / employee_count), avg_salary * 1.5)
    INTO revenue_per_employee
    FROM (
        SELECT 
            d.name as department,
            COUNT(e.id) as employee_count,
            SUM(t.amount) as department_revenue
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id
        LEFT JOIN transactions t ON e.id = t.employee_id
        WHERE d.company_id = company_uuid
        AND d.id = department_uuid
        AND t.created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY d.id, d.name
    ) dept_revenue;
    
    expected_revenue := new_employee_count * revenue_per_employee;
    roi := CASE 
        WHEN total_cost > 0 THEN ((expected_revenue - total_cost) / total_cost) * 100
        ELSE 0
    END;
    
    payback_months := CASE 
        WHEN revenue_per_employee > 0 THEN CEIL(total_cost / (revenue_per_employee / 12))
        ELSE 0
    END;
    
    RETURN QUERY SELECT total_cost, expected_revenue, roi, payback_months;
END;
$$ LANGUAGE plpgsql;

-- Create function to detect hiring triggers
CREATE OR REPLACE FUNCTION detect_hiring_triggers(company_uuid UUID)
RETURNS TABLE(
    trigger_type VARCHAR(50),
    department_name VARCHAR(100),
    trigger_value DECIMAL(10,2),
    threshold_value DECIMAL(10,2),
    severity VARCHAR(20),
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH trigger_analysis AS (
        SELECT 
            'bottleneck' as trigger_type,
            d.name as department_name,
            COUNT(CASE WHEN t.status = 'overdue' THEN 1 END)::DECIMAL as trigger_value,
            5.0 as threshold_value,
            CASE 
                WHEN COUNT(CASE WHEN t.status = 'overdue' THEN 1 END) > 10 THEN 'critical'
                WHEN COUNT(CASE WHEN t.status = 'overdue' THEN 1 END) > 5 THEN 'high'
                WHEN COUNT(CASE WHEN t.status = 'overdue' THEN 1 END) > 2 THEN 'medium'
                ELSE 'low'
            END as severity,
            'Consider hiring additional staff to reduce bottlenecks' as recommendation
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id
        LEFT JOIN tasks t ON e.id = t.assigned_to
        WHERE d.company_id = company_uuid
        GROUP BY d.id, d.name
        HAVING COUNT(CASE WHEN t.status = 'overdue' THEN 1 END) > 2
        
        UNION ALL
        
        SELECT 
            'capacity' as trigger_type,
            d.name as department_name,
            AVG(COUNT(t.id))::DECIMAL as trigger_value,
            8.0 as threshold_value,
            CASE 
                WHEN AVG(COUNT(t.id)) > 15 THEN 'critical'
                WHEN AVG(COUNT(t.id)) > 10 THEN 'high'
                WHEN AVG(COUNT(t.id)) > 8 THEN 'medium'
                ELSE 'low'
            END as severity,
            'Consider hiring to reduce individual workload' as recommendation
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id
        LEFT JOIN tasks t ON e.id = t.assigned_to
        WHERE d.company_id = company_uuid
        AND e.is_active = true
        GROUP BY d.id, d.name, e.id
        HAVING AVG(COUNT(t.id)) > 8
    )
    SELECT 
        ta.trigger_type,
        ta.department_name,
        ta.trigger_value,
        ta.threshold_value,
        ta.severity,
        ta.recommendation
    FROM trigger_analysis ta
    WHERE ta.severity IN ('medium', 'high', 'critical')
    ORDER BY 
        CASE ta.severity
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
        END,
        ta.trigger_value DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate hiring forecast
CREATE OR REPLACE FUNCTION generate_hiring_forecast(
    company_uuid UUID,
    forecast_months INTEGER
)
RETURNS TABLE(
    month_date DATE,
    projected_headcount INTEGER,
    projected_hiring INTEGER,
    projected_departures INTEGER,
    projected_salary_cost DECIMAL(12,2),
    confidence_level DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH historical_data AS (
        SELECT 
            DATE_TRUNC('month', hire_date) as month,
            COUNT(*) as hires,
            AVG(salary) as avg_salary
        FROM employees
        WHERE company_id = company_uuid
        AND hire_date >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', hire_date)
    ),
    current_state AS (
        SELECT 
            COUNT(*) as current_headcount,
            AVG(salary) as avg_salary,
            SUM(salary) as total_salary_cost
        FROM employees
        WHERE company_id = company_uuid
        AND is_active = true
    ),
    projections AS (
        SELECT 
            generate_series(
                CURRENT_DATE,
                CURRENT_DATE + INTERVAL '1 month' * forecast_months,
                INTERVAL '1 month'
            )::DATE as month_date,
            (SELECT current_headcount FROM current_state) + 
            (SELECT AVG(hires) FROM historical_data) * 
            (row_number() OVER (ORDER BY generate_series)) as projected_headcount,
            (SELECT AVG(hires) FROM historical_data) as projected_hiring,
            (SELECT AVG(hires) FROM historical_data) * 0.1 as projected_departures,
            (SELECT total_salary_cost FROM current_state) * 
            (1 + (row_number() OVER (ORDER BY generate_series)) * 0.05) as projected_salary_cost,
            0.8 as confidence_level
        FROM generate_series(1, forecast_months)
    )
    SELECT 
        p.month_date,
        p.projected_headcount::INTEGER,
        p.projected_hiring::INTEGER,
        p.projected_departures::INTEGER,
        p.projected_salary_cost,
        p.confidence_level
    FROM projections p
    ORDER BY p.month_date;
END;
$$ LANGUAGE plpgsql;









