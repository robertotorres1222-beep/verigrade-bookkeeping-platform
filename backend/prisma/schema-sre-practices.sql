-- SRE Practices Schema
-- This schema supports Site Reliability Engineering practices including
-- SLOs, SLIs, error budgets, chaos engineering, performance testing,
-- incident management, runbooks, post-mortems, and toil management

-- SLOs (Service Level Objectives) table
CREATE TABLE IF NOT EXISTS slos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    service VARCHAR(100) NOT NULL,
    sli VARCHAR(100) NOT NULL, -- Service Level Indicator
    target DECIMAL(5,2) NOT NULL, -- Target percentage (e.g., 99.9)
    window VARCHAR(20) NOT NULL, -- Time window (e.g., '30d', '7d', '24h')
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DRAFT')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SLIs (Service Level Indicators) table
CREATE TABLE IF NOT EXISTS slis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slo_id UUID NOT NULL REFERENCES slos(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    value DECIMAL(5,2) NOT NULL, -- SLI value (0-100)
    status VARCHAR(20) NOT NULL CHECK (status IN ('GOOD', 'WARNING', 'CRITICAL')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Error Budgets table
CREATE TABLE IF NOT EXISTS error_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slo_id UUID NOT NULL REFERENCES slos(id) ON DELETE CASCADE,
    total_budget DECIMAL(5,2) NOT NULL, -- Total error budget percentage
    consumed_budget DECIMAL(5,2) NOT NULL DEFAULT 0, -- Consumed error budget percentage
    remaining_budget DECIMAL(5,2) NOT NULL, -- Remaining error budget percentage
    burn_rate DECIMAL(5,2) NOT NULL DEFAULT 0, -- Error budget burn rate
    status VARCHAR(20) NOT NULL CHECK (status IN ('HEALTHY', 'WARNING', 'CRITICAL', 'EXHAUSTED')),
    last_updated TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chaos Experiments table
CREATE TABLE IF NOT EXISTS chaos_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    service VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('NETWORK', 'CPU', 'MEMORY', 'DISK', 'POD', 'CUSTOM')),
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    duration INTEGER NOT NULL, -- Duration in minutes
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    parameters JSONB NOT NULL, -- Experiment parameters
    results JSONB, -- Experiment results
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Tests table
CREATE TABLE IF NOT EXISTS performance_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    service VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('LOAD', 'STRESS', 'SPIKE', 'VOLUME', 'ENDPOINT')),
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    configuration JSONB NOT NULL, -- Test configuration
    results JSONB, -- Test results
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'P1', 'P2', 'P3', 'P4')),
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED')),
    service VARCHAR(100) NOT NULL,
    assignee UUID,
    reporter UUID NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    resolution TEXT,
    impact JSONB NOT NULL, -- Impact details
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Runbooks table
CREATE TABLE IF NOT EXISTS runbooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    service VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('INCIDENT_RESPONSE', 'DEPLOYMENT', 'MAINTENANCE', 'TROUBLESHOOTING')),
    steps JSONB NOT NULL, -- Runbook steps
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post-Mortems table
CREATE TABLE IF NOT EXISTS post_mortems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    timeline JSONB NOT NULL, -- Incident timeline
    root_cause TEXT NOT NULL,
    impact JSONB NOT NULL, -- Impact details
    lessons_learned TEXT[],
    action_items JSONB NOT NULL, -- Action items
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Toil table
CREATE TABLE IF NOT EXISTS toils (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(20) NOT NULL CHECK (category IN ('MANUAL', 'REPETITIVE', 'REACTIVE', 'OPERATIONAL')),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'ON_DEMAND')),
    time_spent INTEGER NOT NULL, -- Time spent in minutes
    automation_potential VARCHAR(10) NOT NULL CHECK (automation_potential IN ('LOW', 'MEDIUM', 'HIGH')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(20) DEFAULT 'IDENTIFIED' CHECK (status IN ('IDENTIFIED', 'AUTOMATED', 'ELIMINATED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SRE Analytics table
CREATE TABLE IF NOT EXISTS sre_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    slo_compliance DECIMAL(5,2) NOT NULL,
    error_budget_health DECIMAL(5,2) NOT NULL,
    incident_count INTEGER NOT NULL DEFAULT 0,
    mttr DECIMAL(8,2) NOT NULL, -- Mean Time To Recovery in minutes
    mtbf DECIMAL(8,2) NOT NULL, -- Mean Time Between Failures in minutes
    toil_reduction DECIMAL(5,2) NOT NULL,
    chaos_experiments INTEGER NOT NULL DEFAULT 0,
    performance_tests INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_slos_service ON slos(service);
CREATE INDEX IF NOT EXISTS idx_slos_status ON slos(status);
CREATE INDEX IF NOT EXISTS idx_slos_target ON slos(target);

CREATE INDEX IF NOT EXISTS idx_slis_slo ON slis(slo_id);
CREATE INDEX IF NOT EXISTS idx_slis_timestamp ON slis(timestamp);
CREATE INDEX IF NOT EXISTS idx_slis_status ON slis(status);

CREATE INDEX IF NOT EXISTS idx_error_budgets_slo ON error_budgets(slo_id);
CREATE INDEX IF NOT EXISTS idx_error_budgets_status ON error_budgets(status);
CREATE INDEX IF NOT EXISTS idx_error_budgets_remaining ON error_budgets(remaining_budget);

CREATE INDEX IF NOT EXISTS idx_chaos_experiments_service ON chaos_experiments(service);
CREATE INDEX IF NOT EXISTS idx_chaos_experiments_status ON chaos_experiments(status);
CREATE INDEX IF NOT EXISTS idx_chaos_experiments_type ON chaos_experiments(type);
CREATE INDEX IF NOT EXISTS idx_chaos_experiments_severity ON chaos_experiments(severity);

CREATE INDEX IF NOT EXISTS idx_performance_tests_service ON performance_tests(service);
CREATE INDEX IF NOT EXISTS idx_performance_tests_status ON performance_tests(status);
CREATE INDEX IF NOT EXISTS idx_performance_tests_type ON performance_tests(type);

CREATE INDEX IF NOT EXISTS idx_incidents_service ON incidents(service);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_start_time ON incidents(start_time);
CREATE INDEX IF NOT EXISTS idx_incidents_assignee ON incidents(assignee);
CREATE INDEX IF NOT EXISTS idx_incidents_reporter ON incidents(reporter);

CREATE INDEX IF NOT EXISTS idx_runbooks_service ON runbooks(service);
CREATE INDEX IF NOT EXISTS idx_runbooks_category ON runbooks(category);
CREATE INDEX IF NOT EXISTS idx_runbooks_status ON runbooks(status);

CREATE INDEX IF NOT EXISTS idx_post_mortems_incident ON post_mortems(incident_id);
CREATE INDEX IF NOT EXISTS idx_post_mortems_status ON post_mortems(status);

CREATE INDEX IF NOT EXISTS idx_toils_category ON toils(category);
CREATE INDEX IF NOT EXISTS idx_toils_status ON toils(status);
CREATE INDEX IF NOT EXISTS idx_toils_priority ON toils(priority);
CREATE INDEX IF NOT EXISTS idx_toils_automation_potential ON toils(automation_potential);

CREATE INDEX IF NOT EXISTS idx_sre_analytics_date ON sre_analytics(date);

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_slo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_slo_updated_at
    BEFORE UPDATE ON slos
    FOR EACH ROW
    EXECUTE FUNCTION update_slo_updated_at();

CREATE TRIGGER trigger_update_chaos_experiment_updated_at
    BEFORE UPDATE ON chaos_experiments
    FOR EACH ROW
    EXECUTE FUNCTION update_slo_updated_at();

CREATE TRIGGER trigger_update_performance_test_updated_at
    BEFORE UPDATE ON performance_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_slo_updated_at();

CREATE TRIGGER trigger_update_incident_updated_at
    BEFORE UPDATE ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_slo_updated_at();

CREATE TRIGGER trigger_update_runbook_updated_at
    BEFORE UPDATE ON runbooks
    FOR EACH ROW
    EXECUTE FUNCTION update_slo_updated_at();

CREATE TRIGGER trigger_update_post_mortem_updated_at
    BEFORE UPDATE ON post_mortems
    FOR EACH ROW
    EXECUTE FUNCTION update_slo_updated_at();

CREATE TRIGGER trigger_update_toil_updated_at
    BEFORE UPDATE ON toils
    FOR EACH ROW
    EXECUTE FUNCTION update_slo_updated_at();

-- Create function to automatically update error budgets
CREATE OR REPLACE FUNCTION update_error_budget_on_sli()
RETURNS TRIGGER AS $$
DECLARE
    slo_record RECORD;
    error_budget_record RECORD;
    new_consumed_budget DECIMAL(5,2);
    new_remaining_budget DECIMAL(5,2);
    new_status VARCHAR(20);
BEGIN
    -- Get SLO details
    SELECT * INTO slo_record FROM slos WHERE id = NEW.slo_id;
    
    -- Get or create error budget
    SELECT * INTO error_budget_record FROM error_budgets WHERE slo_id = NEW.slo_id;
    
    IF error_budget_record IS NULL THEN
        -- Create new error budget
        INSERT INTO error_budgets (slo_id, total_budget, consumed_budget, remaining_budget, burn_rate, status, last_updated)
        VALUES (NEW.slo_id, 100 - slo_record.target, 0, 100 - slo_record.target, 0, 'HEALTHY', CURRENT_TIMESTAMP);
        RETURN NEW;
    END IF;
    
    -- Calculate new consumed budget
    new_consumed_budget := error_budget_record.consumed_budget + (slo_record.target - NEW.value);
    new_remaining_budget := error_budget_record.total_budget - new_consumed_budget;
    
    -- Determine status
    IF new_remaining_budget <= 0 THEN
        new_status := 'EXHAUSTED';
    ELSIF new_remaining_budget < error_budget_record.total_budget * 0.2 THEN
        new_status := 'CRITICAL';
    ELSIF new_remaining_budget < error_budget_record.total_budget * 0.5 THEN
        new_status := 'WARNING';
    ELSE
        new_status := 'HEALTHY';
    END IF;
    
    -- Update error budget
    UPDATE error_budgets 
    SET 
        consumed_budget = new_consumed_budget,
        remaining_budget = new_remaining_budget,
        burn_rate = (slo_record.target - NEW.value) / slo_record.target,
        status = new_status,
        last_updated = CURRENT_TIMESTAMP
    WHERE slo_id = NEW.slo_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_error_budget
    AFTER INSERT ON slis
    FOR EACH ROW
    EXECUTE FUNCTION update_error_budget_on_sli();

-- Create function to calculate incident duration
CREATE OR REPLACE FUNCTION calculate_incident_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
        -- Update impact with calculated duration
        NEW.impact = jsonb_set(
            NEW.impact,
            '{duration}',
            to_jsonb(EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_incident_duration
    BEFORE UPDATE ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION calculate_incident_duration();

-- Create function to generate daily SRE analytics
CREATE OR REPLACE FUNCTION generate_daily_sre_analytics()
RETURNS TRIGGER AS $$
DECLARE
    analytics_date DATE;
    slo_compliance DECIMAL(5,2);
    error_budget_health DECIMAL(5,2);
    incident_count INTEGER;
    mttr DECIMAL(8,2);
    mtbf DECIMAL(8,2);
    toil_reduction DECIMAL(5,2);
    chaos_experiments INTEGER;
    performance_tests INTEGER;
BEGIN
    analytics_date := CURRENT_DATE;
    
    -- Calculate SLO compliance
    SELECT COALESCE(AVG(value), 0) INTO slo_compliance
    FROM slis
    WHERE timestamp >= analytics_date
    AND timestamp < analytics_date + INTERVAL '1 day';
    
    -- Calculate error budget health
    SELECT COALESCE(AVG(remaining_budget / total_budget * 100), 100) INTO error_budget_health
    FROM error_budgets
    WHERE last_updated >= analytics_date
    AND last_updated < analytics_date + INTERVAL '1 day';
    
    -- Count incidents
    SELECT COUNT(*) INTO incident_count
    FROM incidents
    WHERE created_at >= analytics_date
    AND created_at < analytics_date + INTERVAL '1 day';
    
    -- Calculate MTTR
    SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60), 0) INTO mttr
    FROM incidents
    WHERE end_time IS NOT NULL
    AND created_at >= analytics_date
    AND created_at < analytics_date + INTERVAL '1 day';
    
    -- Calculate MTBF
    SELECT COALESCE(24 * 60 / NULLIF(COUNT(*), 0), 0) INTO mtbf
    FROM incidents
    WHERE created_at >= analytics_date
    AND created_at < analytics_date + INTERVAL '1 day';
    
    -- Calculate toil reduction
    SELECT COALESCE(
        (COUNT(*) FILTER (WHERE status = 'AUTOMATED' OR status = 'ELIMINATED')::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
        0
    ) INTO toil_reduction
    FROM toils;
    
    -- Count experiments and tests
    SELECT COUNT(*) INTO chaos_experiments
    FROM chaos_experiments
    WHERE created_at >= analytics_date
    AND created_at < analytics_date + INTERVAL '1 day';
    
    SELECT COUNT(*) INTO performance_tests
    FROM performance_tests
    WHERE created_at >= analytics_date
    AND created_at < analytics_date + INTERVAL '1 day';
    
    -- Insert or update analytics
    INSERT INTO sre_analytics (
        date, slo_compliance, error_budget_health, incident_count,
        mttr, mtbf, toil_reduction, chaos_experiments, performance_tests
    ) VALUES (
        analytics_date, slo_compliance, error_budget_health, incident_count,
        mttr, mtbf, toil_reduction, chaos_experiments, performance_tests
    )
    ON CONFLICT (date) DO UPDATE SET
        slo_compliance = EXCLUDED.slo_compliance,
        error_budget_health = EXCLUDED.error_budget_health,
        incident_count = EXCLUDED.incident_count,
        mttr = EXCLUDED.mttr,
        mtbf = EXCLUDED.mtbf,
        toil_reduction = EXCLUDED.toil_reduction,
        chaos_experiments = EXCLUDED.chaos_experiments,
        performance_tests = EXCLUDED.performance_tests;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_daily_analytics
    AFTER INSERT ON slis
    FOR EACH ROW
    EXECUTE FUNCTION generate_daily_sre_analytics();



