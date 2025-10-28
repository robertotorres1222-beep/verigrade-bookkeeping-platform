-- Contract Management Schema
-- This schema supports AI Contract Lifecycle Management

-- Contract Analysis table
CREATE TABLE contract_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL,
    contract_name VARCHAR(255) NOT NULL,
    contract_type VARCHAR(100) NOT NULL,
    vendor_name VARCHAR(255),
    contract_value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    start_date DATE,
    end_date DATE,
    renewal_date DATE,
    payment_terms VARCHAR(100),
    billing_frequency VARCHAR(50),
    contract_status VARCHAR(50) DEFAULT 'active',
    risk_score INTEGER DEFAULT 0,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    extracted_terms JSONB,
    revenue_recognition_schedule JSONB,
    renewal_terms JSONB,
    termination_clauses JSONB,
    auto_renewal BOOLEAN DEFAULT false,
    notice_period_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, contract_id)
);

-- Contract Modifications table
CREATE TABLE contract_modifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_analysis_id UUID NOT NULL REFERENCES contract_analysis(id) ON DELETE CASCADE,
    modification_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
    impact JSONB NOT NULL,
    approval_required BOOLEAN DEFAULT true,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contract Risk Assessment table
CREATE TABLE contract_risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_analysis_id UUID NOT NULL REFERENCES contract_analysis(id) ON DELETE CASCADE,
    risk_category VARCHAR(100) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    risk_score INTEGER NOT NULL,
    risk_description TEXT,
    mitigation_strategy TEXT,
    assessed_by UUID REFERENCES users(id),
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Upsell Opportunities table
CREATE TABLE upsell_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_analysis_id UUID NOT NULL REFERENCES contract_analysis(id) ON DELETE CASCADE,
    opportunity_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    potential_value DECIMAL(15,2),
    probability DECIMAL(3,2),
    expected_close_date DATE,
    assigned_to UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'identified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contract Renewal Tracking table
CREATE TABLE contract_renewals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_analysis_id UUID NOT NULL REFERENCES contract_analysis(id) ON DELETE CASCADE,
    renewal_date DATE NOT NULL,
    renewal_type VARCHAR(50) NOT NULL,
    renewal_value DECIMAL(15,2),
    renewal_terms JSONB,
    renewal_status VARCHAR(50) DEFAULT 'upcoming',
    renewal_probability DECIMAL(3,2),
    renewal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contract Templates table
CREATE TABLE contract_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(100) NOT NULL,
    template_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contract Compliance Tracking table
CREATE TABLE contract_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_analysis_id UUID NOT NULL REFERENCES contract_analysis(id) ON DELETE CASCADE,
    compliance_requirement VARCHAR(255) NOT NULL,
    compliance_status VARCHAR(50) NOT NULL,
    due_date DATE,
    completion_date DATE,
    compliance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contract Performance Metrics table
CREATE TABLE contract_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_analysis_id UUID NOT NULL REFERENCES contract_analysis(id) ON DELETE CASCADE,
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_unit VARCHAR(50),
    measurement_date DATE NOT NULL,
    target_value DECIMAL(15,2),
    performance_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contract Document Attachments table
CREATE TABLE contract_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_analysis_id UUID NOT NULL REFERENCES contract_analysis(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    document_version VARCHAR(50),
    is_original BOOLEAN DEFAULT false,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contract Approval Workflow table
CREATE TABLE contract_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_analysis_id UUID NOT NULL REFERENCES contract_analysis(id) ON DELETE CASCADE,
    approval_type VARCHAR(100) NOT NULL,
    approval_status VARCHAR(50) DEFAULT 'pending',
    approver_id UUID NOT NULL REFERENCES users(id),
    approval_notes TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contract Integration Logs table
CREATE TABLE contract_integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_analysis_id UUID NOT NULL REFERENCES contract_analysis(id) ON DELETE CASCADE,
    integration_type VARCHAR(100) NOT NULL,
    integration_status VARCHAR(50) NOT NULL,
    integration_data JSONB,
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_contract_analysis_company_id ON contract_analysis(company_id);
CREATE INDEX idx_contract_analysis_contract_id ON contract_analysis(contract_id);
CREATE INDEX idx_contract_analysis_status ON contract_analysis(contract_status);
CREATE INDEX idx_contract_analysis_renewal_date ON contract_analysis(renewal_date);
CREATE INDEX idx_contract_analysis_risk_score ON contract_analysis(risk_score);

CREATE INDEX idx_contract_modifications_contract_analysis_id ON contract_modifications(contract_analysis_id);
CREATE INDEX idx_contract_modifications_type ON contract_modifications(modification_type);
CREATE INDEX idx_contract_modifications_status ON contract_modifications(status);

CREATE INDEX idx_contract_risk_assessments_contract_analysis_id ON contract_risk_assessments(contract_analysis_id);
CREATE INDEX idx_contract_risk_assessments_risk_level ON contract_risk_assessments(risk_level);

CREATE INDEX idx_upsell_opportunities_contract_analysis_id ON upsell_opportunities(contract_analysis_id);
CREATE INDEX idx_upsell_opportunities_status ON upsell_opportunities(status);

CREATE INDEX idx_contract_renewals_contract_analysis_id ON contract_renewals(contract_analysis_id);
CREATE INDEX idx_contract_renewals_renewal_date ON contract_renewals(renewal_date);

CREATE INDEX idx_contract_templates_company_id ON contract_templates(company_id);
CREATE INDEX idx_contract_templates_type ON contract_templates(template_type);

CREATE INDEX idx_contract_compliance_contract_analysis_id ON contract_compliance(contract_analysis_id);
CREATE INDEX idx_contract_compliance_status ON contract_compliance(compliance_status);

CREATE INDEX idx_contract_performance_metrics_contract_analysis_id ON contract_performance_metrics(contract_analysis_id);
CREATE INDEX idx_contract_performance_metrics_measurement_date ON contract_performance_metrics(measurement_date);

CREATE INDEX idx_contract_documents_contract_analysis_id ON contract_documents(contract_analysis_id);
CREATE INDEX idx_contract_documents_type ON contract_documents(document_type);

CREATE INDEX idx_contract_approvals_contract_analysis_id ON contract_approvals(contract_analysis_id);
CREATE INDEX idx_contract_approvals_status ON contract_approvals(approval_status);

CREATE INDEX idx_contract_integration_logs_contract_analysis_id ON contract_integration_logs(contract_analysis_id);
CREATE INDEX idx_contract_integration_logs_type ON contract_integration_logs(integration_type);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contract_analysis_updated_at BEFORE UPDATE ON contract_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contract_modifications_updated_at BEFORE UPDATE ON contract_modifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_upsell_opportunities_updated_at BEFORE UPDATE ON upsell_opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contract_renewals_updated_at BEFORE UPDATE ON contract_renewals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contract_templates_updated_at BEFORE UPDATE ON contract_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contract_compliance_updated_at BEFORE UPDATE ON contract_compliance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contract_approvals_updated_at BEFORE UPDATE ON contract_approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();









