-- Approval Workflows Tables
-- This schema defines tables for storing approval workflows, requests, steps, and analytics

-- Approval Workflows Table
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    workflow_name VARCHAR(100) NOT NULL,
    workflow_description TEXT,
    workflow_type VARCHAR(20) NOT NULL, -- 'invoice', 'expense', 'payment', 'purchase_order'
    workflow_steps JSONB NOT NULL, -- Array of workflow steps
    conditions JSONB, -- Workflow conditions for auto-assignment
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Approval Requests Table
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
    request_type VARCHAR(20) NOT NULL, -- 'invoice', 'expense', 'payment', 'purchase_order'
    request_data JSONB NOT NULL, -- Request-specific data
    requestor_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL, -- 'pending', 'approved', 'rejected', 'cancelled'
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Approval Steps Table
CREATE TABLE IF NOT EXISTS approval_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES approval_requests(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    approver_id UUID REFERENCES users(id),
    approver_type VARCHAR(20) NOT NULL, -- 'user', 'role', 'department'
    is_required BOOLEAN DEFAULT TRUE,
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL, -- 'pending', 'approved', 'rejected', 'skipped'
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    approval_notes TEXT,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejected_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Approval Notifications Table
CREATE TABLE IF NOT EXISTS approval_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    request_id UUID REFERENCES approval_requests(id) ON DELETE CASCADE,
    step_id UUID REFERENCES approval_steps(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'approval_required', 'approval_approved', 'approval_rejected', 'approval_escalated'
    recipient_id UUID REFERENCES users(id),
    notification_data JSONB, -- Notification-specific data
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Approval Escalations Table
CREATE TABLE IF NOT EXISTS approval_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    request_id UUID REFERENCES approval_requests(id) ON DELETE CASCADE,
    step_id UUID REFERENCES approval_steps(id) ON DELETE CASCADE,
    escalation_type VARCHAR(20) NOT NULL, -- 'timeout', 'manual', 'priority'
    escalated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    escalated_by UUID REFERENCES users(id),
    escalation_reason TEXT,
    new_approver_id UUID REFERENCES users(id),
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Approval Analytics Table
CREATE TABLE IF NOT EXISTS approval_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    total_requests INTEGER DEFAULT 0,
    pending_requests INTEGER DEFAULT 0,
    approved_requests INTEGER DEFAULT 0,
    rejected_requests INTEGER DEFAULT 0,
    cancelled_requests INTEGER DEFAULT 0,
    avg_processing_hours DECIMAL(8,2) DEFAULT 0,
    approval_rate DECIMAL(5,2) DEFAULT 0,
    rejection_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Approval Templates Table
CREATE TABLE IF NOT EXISTS approval_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_name VARCHAR(100) NOT NULL,
    template_description TEXT,
    template_type VARCHAR(20) NOT NULL, -- 'invoice', 'expense', 'payment', 'purchase_order'
    template_steps JSONB NOT NULL, -- Template workflow steps
    template_conditions JSONB, -- Template conditions
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Approval Rules Table
CREATE TABLE IF NOT EXISTS approval_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    rule_name VARCHAR(100) NOT NULL,
    rule_description TEXT,
    rule_type VARCHAR(20) NOT NULL, -- 'auto_approve', 'auto_reject', 'escalate', 'assign'
    rule_conditions JSONB NOT NULL, -- Rule conditions
    rule_actions JSONB NOT NULL, -- Rule actions
    priority INTEGER DEFAULT 0, -- Higher priority rules are evaluated first
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_approval_workflows_company_id ON approval_workflows(company_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_type ON approval_workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_active ON approval_workflows(is_active);

CREATE INDEX IF NOT EXISTS idx_approval_requests_company_id ON approval_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_workflow_id ON approval_requests(workflow_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_type ON approval_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requestor ON approval_requests(requestor_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_priority ON approval_requests(priority);
CREATE INDEX IF NOT EXISTS idx_approval_requests_due_date ON approval_requests(due_date);
CREATE INDEX IF NOT EXISTS idx_approval_requests_created_at ON approval_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_approval_steps_request_id ON approval_steps(request_id);
CREATE INDEX IF NOT EXISTS idx_approval_steps_approver ON approval_steps(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_steps_status ON approval_steps(status);
CREATE INDEX IF NOT EXISTS idx_approval_steps_due_date ON approval_steps(due_date);
CREATE INDEX IF NOT EXISTS idx_approval_steps_step_number ON approval_steps(step_number);

CREATE INDEX IF NOT EXISTS idx_approval_notifications_company_id ON approval_notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_request_id ON approval_notifications(request_id);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_step_id ON approval_notifications(step_id);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_recipient ON approval_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_type ON approval_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_sent ON approval_notifications(is_sent);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_read ON approval_notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_approval_escalations_company_id ON approval_escalations(company_id);
CREATE INDEX IF NOT EXISTS idx_approval_escalations_request_id ON approval_escalations(request_id);
CREATE INDEX IF NOT EXISTS idx_approval_escalations_step_id ON approval_escalations(step_id);
CREATE INDEX IF NOT EXISTS idx_approval_escalations_type ON approval_escalations(escalation_type);
CREATE INDEX IF NOT EXISTS idx_approval_escalations_resolved ON approval_escalations(is_resolved);

CREATE INDEX IF NOT EXISTS idx_approval_analytics_company_id ON approval_analytics(company_id);
CREATE INDEX IF NOT EXISTS idx_approval_analytics_analysis_date ON approval_analytics(analysis_date);

CREATE INDEX IF NOT EXISTS idx_approval_templates_company_id ON approval_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_approval_templates_type ON approval_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_approval_templates_active ON approval_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_approval_rules_company_id ON approval_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_approval_rules_type ON approval_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_approval_rules_priority ON approval_rules(priority);
CREATE INDEX IF NOT EXISTS idx_approval_rules_active ON approval_rules(is_active);

-- Add foreign key constraints
ALTER TABLE approval_workflows ADD CONSTRAINT fk_approval_workflows_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE approval_requests ADD CONSTRAINT fk_approval_requests_workflow 
    FOREIGN KEY (workflow_id) REFERENCES approval_workflows(id);
ALTER TABLE approval_requests ADD CONSTRAINT fk_approval_requests_requestor 
    FOREIGN KEY (requestor_id) REFERENCES users(id);

ALTER TABLE approval_steps ADD CONSTRAINT fk_approval_steps_request 
    FOREIGN KEY (request_id) REFERENCES approval_requests(id);
ALTER TABLE approval_steps ADD CONSTRAINT fk_approval_steps_approver 
    FOREIGN KEY (approver_id) REFERENCES users(id);
ALTER TABLE approval_steps ADD CONSTRAINT fk_approval_steps_approved_by 
    FOREIGN KEY (approved_by) REFERENCES users(id);
ALTER TABLE approval_steps ADD CONSTRAINT fk_approval_steps_rejected_by 
    FOREIGN KEY (rejected_by) REFERENCES users(id);

ALTER TABLE approval_notifications ADD CONSTRAINT fk_approval_notifications_request 
    FOREIGN KEY (request_id) REFERENCES approval_requests(id);
ALTER TABLE approval_notifications ADD CONSTRAINT fk_approval_notifications_step 
    FOREIGN KEY (step_id) REFERENCES approval_steps(id);
ALTER TABLE approval_notifications ADD CONSTRAINT fk_approval_notifications_recipient 
    FOREIGN KEY (recipient_id) REFERENCES users(id);

ALTER TABLE approval_escalations ADD CONSTRAINT fk_approval_escalations_request 
    FOREIGN KEY (request_id) REFERENCES approval_requests(id);
ALTER TABLE approval_escalations ADD CONSTRAINT fk_approval_escalations_step 
    FOREIGN KEY (step_id) REFERENCES approval_steps(id);
ALTER TABLE approval_escalations ADD CONSTRAINT fk_approval_escalations_escalated_by 
    FOREIGN KEY (escalated_by) REFERENCES users(id);
ALTER TABLE approval_escalations ADD CONSTRAINT fk_approval_escalations_new_approver 
    FOREIGN KEY (new_approver_id) REFERENCES users(id);
ALTER TABLE approval_escalations ADD CONSTRAINT fk_approval_escalations_resolved_by 
    FOREIGN KEY (resolved_by) REFERENCES users(id);

ALTER TABLE approval_templates ADD CONSTRAINT fk_approval_templates_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE approval_rules ADD CONSTRAINT fk_approval_rules_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);