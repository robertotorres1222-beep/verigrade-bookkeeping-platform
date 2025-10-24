-- Advanced Security & Compliance Schema
-- This schema supports comprehensive security and compliance management including
-- security scanning, compliance frameworks, assessments, controls, incidents,
-- data subject requests, privacy impact assessments, and security training

-- Security Scans table
CREATE TABLE IF NOT EXISTS security_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('VULNERABILITY', 'DEPENDENCY', 'SECRET', 'LICENSE', 'IAC', 'CONTAINER', 'CODE_QUALITY')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
    target VARCHAR(500) NOT NULL, -- Repository, service, or file path
    tool VARCHAR(100) NOT NULL, -- Trivy, Snyk, SonarQube, OWASP ZAP, etc.
    configuration JSONB NOT NULL, -- Scan configuration
    results JSONB, -- Scan results
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance Frameworks table
CREATE TABLE IF NOT EXISTS compliance_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('SOC2', 'GDPR', 'PCI_DSS', 'HIPAA', 'ISO27001', 'NIST', 'CUSTOM')),
    version VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DRAFT', 'ARCHIVED')),
    description TEXT,
    requirements JSONB NOT NULL, -- Framework requirements
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance Assessments table
CREATE TABLE IF NOT EXISTS compliance_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id UUID NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'REVIEW', 'APPROVED')),
    assessor UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    scope TEXT[] NOT NULL, -- Assessment scope
    findings JSONB NOT NULL, -- Assessment findings
    score DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Controls table
CREATE TABLE IF NOT EXISTS security_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('ACCESS_CONTROL', 'DATA_PROTECTION', 'NETWORK_SECURITY', 'INCIDENT_RESPONSE', 'MONITORING', 'BACKUP', 'ENCRYPTION')),
    type VARCHAR(20) NOT NULL CHECK (type IN ('PREVENTIVE', 'DETECTIVE', 'CORRECTIVE', 'COMPENSATING')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'TESTING', 'FAILED')),
    description TEXT NOT NULL,
    implementation TEXT NOT NULL,
    testing TEXT NOT NULL,
    monitoring TEXT NOT NULL,
    effectiveness DECIMAL(5,2) NOT NULL DEFAULT 0, -- 0-100
    last_tested TIMESTAMP,
    next_test TIMESTAMP,
    owner UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Incidents table
CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED')),
    category VARCHAR(30) NOT NULL CHECK (category IN ('DATA_BREACH', 'MALWARE', 'UNAUTHORIZED_ACCESS', 'PHISHING', 'DDOS', 'INSIDER_THREAT', 'OTHER')),
    reporter UUID NOT NULL,
    assignee UUID,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    impact JSONB NOT NULL, -- Impact details
    timeline JSONB NOT NULL, -- Incident timeline
    resolution TEXT,
    lessons_learned TEXT[],
    prevention_measures TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Subject Requests table
CREATE TABLE IF NOT EXISTS data_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id VARCHAR(255) NOT NULL, -- User ID or external identifier
    type VARCHAR(20) NOT NULL CHECK (type IN ('ACCESS', 'RECTIFICATION', 'ERASURE', 'PORTABILITY', 'RESTRICTION', 'OBJECTION')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED')),
    requester VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    data_types TEXT[] NOT NULL,
    due_date DATE NOT NULL,
    completed_date DATE,
    response TEXT,
    attachments TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Privacy Impact Assessments table
CREATE TABLE IF NOT EXISTS privacy_impact_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    data_types TEXT[] NOT NULL,
    processing_purposes TEXT[] NOT NULL,
    data_subjects TEXT[] NOT NULL,
    data_retention TEXT NOT NULL,
    data_sharing TEXT[] NOT NULL,
    risk_level VARCHAR(10) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    mitigation_measures TEXT[] NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REVIEW', 'APPROVED', 'REJECTED')),
    approver UUID,
    approved_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Trainings table
CREATE TABLE IF NOT EXISTS security_trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('ONLINE', 'IN_PERSON', 'WORKSHOP', 'SIMULATION')),
    category VARCHAR(30) NOT NULL CHECK (category IN ('GENERAL', 'PHISHING', 'SOCIAL_ENGINEERING', 'DATA_PROTECTION', 'INCIDENT_RESPONSE')),
    duration INTEGER NOT NULL, -- in minutes
    content TEXT NOT NULL,
    quiz JSONB, -- Training quiz
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Training Records table
CREATE TABLE IF NOT EXISTS security_training_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id UUID NOT NULL REFERENCES security_trainings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'EXPIRED')),
    assigned_date DATE NOT NULL,
    completed_date DATE,
    score DECIMAL(5,2),
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Compliance Analytics table
CREATE TABLE IF NOT EXISTS security_compliance_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    security_score DECIMAL(5,2) NOT NULL,
    compliance_score DECIMAL(5,2) NOT NULL,
    vulnerability_count INTEGER NOT NULL DEFAULT 0,
    critical_vulnerabilities INTEGER NOT NULL DEFAULT 0,
    open_incidents INTEGER NOT NULL DEFAULT 0,
    resolved_incidents INTEGER NOT NULL DEFAULT 0,
    training_completion DECIMAL(5,2) NOT NULL DEFAULT 0,
    data_subject_requests INTEGER NOT NULL DEFAULT 0,
    privacy_assessments INTEGER NOT NULL DEFAULT 0,
    security_controls INTEGER NOT NULL DEFAULT 0,
    active_controls INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_security_scans_type ON security_scans(type);
CREATE INDEX IF NOT EXISTS idx_security_scans_status ON security_scans(status);
CREATE INDEX IF NOT EXISTS idx_security_scans_tool ON security_scans(tool);
CREATE INDEX IF NOT EXISTS idx_security_scans_target ON security_scans(target);

CREATE INDEX IF NOT EXISTS idx_compliance_frameworks_type ON compliance_frameworks(type);
CREATE INDEX IF NOT EXISTS idx_compliance_frameworks_status ON compliance_frameworks(status);

CREATE INDEX IF NOT EXISTS idx_compliance_assessments_framework ON compliance_assessments(framework_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_status ON compliance_assessments(status);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_assessor ON compliance_assessments(assessor);

CREATE INDEX IF NOT EXISTS idx_security_controls_category ON security_controls(category);
CREATE INDEX IF NOT EXISTS idx_security_controls_status ON security_controls(status);
CREATE INDEX IF NOT EXISTS idx_security_controls_owner ON security_controls(owner);

CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_category ON security_incidents(category);
CREATE INDEX IF NOT EXISTS idx_security_incidents_start_time ON security_incidents(start_time);
CREATE INDEX IF NOT EXISTS idx_security_incidents_reporter ON security_incidents(reporter);
CREATE INDEX IF NOT EXISTS idx_security_incidents_assignee ON security_incidents(assignee);

CREATE INDEX IF NOT EXISTS idx_data_subject_requests_type ON data_subject_requests(type);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_status ON data_subject_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_subject_id ON data_subject_requests(subject_id);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_due_date ON data_subject_requests(due_date);

CREATE INDEX IF NOT EXISTS idx_privacy_assessments_status ON privacy_impact_assessments(status);
CREATE INDEX IF NOT EXISTS idx_privacy_assessments_risk_level ON privacy_impact_assessments(risk_level);

CREATE INDEX IF NOT EXISTS idx_security_trainings_type ON security_trainings(type);
CREATE INDEX IF NOT EXISTS idx_security_trainings_category ON security_trainings(category);
CREATE INDEX IF NOT EXISTS idx_security_trainings_status ON security_trainings(status);

CREATE INDEX IF NOT EXISTS idx_training_records_training ON security_training_records(training_id);
CREATE INDEX IF NOT EXISTS idx_training_records_user ON security_training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_training_records_status ON security_training_records(status);
CREATE INDEX IF NOT EXISTS idx_training_records_due_date ON security_training_records(due_date);

CREATE INDEX IF NOT EXISTS idx_security_analytics_date ON security_compliance_analytics(date);

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_security_scan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_security_scan_updated_at
    BEFORE UPDATE ON security_scans
    FOR EACH ROW
    EXECUTE FUNCTION update_security_scan_updated_at();

CREATE TRIGGER trigger_update_compliance_framework_updated_at
    BEFORE UPDATE ON compliance_frameworks
    FOR EACH ROW
    EXECUTE FUNCTION update_security_scan_updated_at();

CREATE TRIGGER trigger_update_compliance_assessment_updated_at
    BEFORE UPDATE ON compliance_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_security_scan_updated_at();

CREATE TRIGGER trigger_update_security_control_updated_at
    BEFORE UPDATE ON security_controls
    FOR EACH ROW
    EXECUTE FUNCTION update_security_scan_updated_at();

CREATE TRIGGER trigger_update_security_incident_updated_at
    BEFORE UPDATE ON security_incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_security_scan_updated_at();

CREATE TRIGGER trigger_update_data_subject_request_updated_at
    BEFORE UPDATE ON data_subject_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_security_scan_updated_at();

CREATE TRIGGER trigger_update_privacy_assessment_updated_at
    BEFORE UPDATE ON privacy_impact_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_security_scan_updated_at();

CREATE TRIGGER trigger_update_security_training_updated_at
    BEFORE UPDATE ON security_trainings
    FOR EACH ROW
    EXECUTE FUNCTION update_security_scan_updated_at();

CREATE TRIGGER trigger_update_training_record_updated_at
    BEFORE UPDATE ON security_training_records
    FOR EACH ROW
    EXECUTE FUNCTION update_security_scan_updated_at();

-- Create function to calculate security score
CREATE OR REPLACE FUNCTION calculate_security_score()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.results IS NOT NULL AND OLD.results IS NULL THEN
        -- Update security score based on scan results
        INSERT INTO security_compliance_analytics (
            date, security_score, compliance_score, vulnerability_count,
            critical_vulnerabilities, open_incidents, resolved_incidents,
            training_completion, data_subject_requests, privacy_assessments,
            security_controls, active_controls
        ) VALUES (
            CURRENT_DATE,
            COALESCE((NEW.results->>'summary'->>'riskScore')::DECIMAL, 0),
            0, -- compliance_score
            COALESCE((NEW.results->>'summary'->>'totalIssues')::INTEGER, 0),
            COALESCE((NEW.results->>'summary'->>'criticalIssues')::INTEGER, 0),
            0, -- open_incidents
            0, -- resolved_incidents
            0, -- training_completion
            0, -- data_subject_requests
            0, -- privacy_assessments
            0, -- security_controls
            0  -- active_controls
        )
        ON CONFLICT (date) DO UPDATE SET
            security_score = EXCLUDED.security_score,
            vulnerability_count = EXCLUDED.vulnerability_count,
            critical_vulnerabilities = EXCLUDED.critical_vulnerabilities;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_security_score
    AFTER UPDATE ON security_scans
    FOR EACH ROW
    EXECUTE FUNCTION calculate_security_score();

-- Create function to update training completion
CREATE OR REPLACE FUNCTION update_training_completion()
RETURNS TRIGGER AS $$
DECLARE
    total_records INTEGER;
    completed_records INTEGER;
    completion_rate DECIMAL(5,2);
BEGIN
    -- Calculate training completion rate
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'COMPLETED')
    INTO total_records, completed_records
    FROM security_training_records
    WHERE training_id = NEW.training_id;
    
    completion_rate := CASE 
        WHEN total_records > 0 THEN (completed_records::DECIMAL / total_records) * 100
        ELSE 0
    END;
    
    -- Update analytics
    INSERT INTO security_compliance_analytics (
        date, security_score, compliance_score, vulnerability_count,
        critical_vulnerabilities, open_incidents, resolved_incidents,
        training_completion, data_subject_requests, privacy_assessments,
        security_controls, active_controls
    ) VALUES (
        CURRENT_DATE, 0, 0, 0, 0, 0, 0, completion_rate, 0, 0, 0, 0
    )
    ON CONFLICT (date) DO UPDATE SET
        training_completion = EXCLUDED.training_completion;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_training_completion
    AFTER UPDATE ON security_training_records
    FOR EACH ROW
    EXECUTE FUNCTION update_training_completion();

-- Create function to generate daily security analytics
CREATE OR REPLACE FUNCTION generate_daily_security_analytics()
RETURNS TRIGGER AS $$
DECLARE
    analytics_date DATE;
    security_score DECIMAL(5,2);
    compliance_score DECIMAL(5,2);
    vulnerability_count INTEGER;
    critical_vulnerabilities INTEGER;
    open_incidents INTEGER;
    resolved_incidents INTEGER;
    training_completion DECIMAL(5,2);
    data_subject_requests INTEGER;
    privacy_assessments INTEGER;
    security_controls INTEGER;
    active_controls INTEGER;
BEGIN
    analytics_date := CURRENT_DATE;
    
    -- Calculate security score from completed scans
    SELECT COALESCE(AVG(100 - (results->>'summary'->>'riskScore')::DECIMAL), 0)
    INTO security_score
    FROM security_scans
    WHERE status = 'COMPLETED'
    AND created_at >= analytics_date
    AND created_at < analytics_date + INTERVAL '1 day';
    
    -- Calculate compliance score from completed assessments
    SELECT COALESCE(AVG(score), 0)
    INTO compliance_score
    FROM compliance_assessments
    WHERE status = 'COMPLETED'
    AND created_at >= analytics_date
    AND created_at < analytics_date + INTERVAL '1 day';
    
    -- Count vulnerabilities
    SELECT COALESCE(SUM((results->>'summary'->>'totalIssues')::INTEGER), 0)
    INTO vulnerability_count
    FROM security_scans
    WHERE status = 'COMPLETED'
    AND created_at >= analytics_date
    AND created_at < analytics_date + INTERVAL '1 day';
    
    SELECT COALESCE(SUM((results->>'summary'->>'criticalIssues')::INTEGER), 0)
    INTO critical_vulnerabilities
    FROM security_scans
    WHERE status = 'COMPLETED'
    AND created_at >= analytics_date
    AND created_at < analytics_date + INTERVAL '1 day';
    
    -- Count incidents
    SELECT COUNT(*) FILTER (WHERE status != 'CLOSED')
    INTO open_incidents
    FROM security_incidents
    WHERE created_at >= analytics_date
    AND created_at < analytics_date + INTERVAL '1 day';
    
    SELECT COUNT(*) FILTER (WHERE status = 'RESOLVED' OR status = 'CLOSED')
    INTO resolved_incidents
    FROM security_incidents
    WHERE created_at >= analytics_date
    AND created_at < analytics_date + INTERVAL '1 day';
    
    -- Calculate training completion
    SELECT COALESCE(
        (COUNT(*) FILTER (WHERE status = 'COMPLETED')::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
        0
    )
    INTO training_completion
    FROM security_training_records;
    
    -- Count other metrics
    SELECT COUNT(*) INTO data_subject_requests
    FROM data_subject_requests
    WHERE created_at >= analytics_date
    AND created_at < analytics_date + INTERVAL '1 day';
    
    SELECT COUNT(*) INTO privacy_assessments
    FROM privacy_impact_assessments
    WHERE created_at >= analytics_date
    AND created_at < analytics_date + INTERVAL '1 day';
    
    SELECT COUNT(*) INTO security_controls
    FROM security_controls;
    
    SELECT COUNT(*) INTO active_controls
    FROM security_controls
    WHERE status = 'ACTIVE';
    
    -- Insert or update analytics
    INSERT INTO security_compliance_analytics (
        date, security_score, compliance_score, vulnerability_count,
        critical_vulnerabilities, open_incidents, resolved_incidents,
        training_completion, data_subject_requests, privacy_assessments,
        security_controls, active_controls
    ) VALUES (
        analytics_date, security_score, compliance_score, vulnerability_count,
        critical_vulnerabilities, open_incidents, resolved_incidents,
        training_completion, data_subject_requests, privacy_assessments,
        security_controls, active_controls
    )
    ON CONFLICT (date) DO UPDATE SET
        security_score = EXCLUDED.security_score,
        compliance_score = EXCLUDED.compliance_score,
        vulnerability_count = EXCLUDED.vulnerability_count,
        critical_vulnerabilities = EXCLUDED.critical_vulnerabilities,
        open_incidents = EXCLUDED.open_incidents,
        resolved_incidents = EXCLUDED.resolved_incidents,
        training_completion = EXCLUDED.training_completion,
        data_subject_requests = EXCLUDED.data_subject_requests,
        privacy_assessments = EXCLUDED.privacy_assessments,
        security_controls = EXCLUDED.security_controls,
        active_controls = EXCLUDED.active_controls;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_daily_security_analytics
    AFTER INSERT ON security_scans
    FOR EACH ROW
    EXECUTE FUNCTION generate_daily_security_analytics();




