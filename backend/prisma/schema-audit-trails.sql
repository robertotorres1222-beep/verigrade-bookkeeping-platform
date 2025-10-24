-- Audit Trails Tables
-- This schema defines tables for storing immutable audit trails with SHA-256 hashing

-- Audit Trails Table
CREATE TABLE IF NOT EXISTS audit_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'transaction', 'invoice', 'expense', 'payment', 'customer', 'vendor'
    entity_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'create', 'update', 'delete', 'view', 'export', 'login', 'logout'
    user_id UUID REFERENCES users(id),
    user_email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    before_data JSONB, -- Data before the change
    after_data JSONB, -- Data after the change
    changes JSONB, -- Array of specific changes made
    audit_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of the audit data
    metadata JSONB, -- Additional metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Trail Snapshots Table
CREATE TABLE IF NOT EXISTS audit_trail_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    snapshot_data JSONB NOT NULL, -- Complete snapshot of the entity
    snapshot_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of the snapshot
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Trail Integrity Table
CREATE TABLE IF NOT EXISTS audit_trail_integrity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    audit_trail_id UUID REFERENCES audit_trails(id) ON DELETE CASCADE,
    verification_hash VARCHAR(64) NOT NULL, -- Recalculated hash
    is_integrity_valid BOOLEAN NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_by UUID REFERENCES users(id)
);

-- Audit Trail Exports Table
CREATE TABLE IF NOT EXISTS audit_trail_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL, -- 'csv', 'json', 'pdf', 'excel'
    export_filters JSONB, -- Filters used for the export
    export_data JSONB, -- Exported data
    export_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of the export
    file_path TEXT, -- Path to the exported file
    file_size INTEGER, -- File size in bytes
    is_encrypted BOOLEAN DEFAULT FALSE,
    encryption_key_id VARCHAR(100), -- ID of the encryption key used
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Trail Retention Table
CREATE TABLE IF NOT EXISTS audit_trail_retention (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    retention_policy VARCHAR(50) NOT NULL, -- '7_years', '10_years', 'indefinite', 'custom'
    retention_days INTEGER, -- Custom retention period in days
    is_active BOOLEAN DEFAULT TRUE,
    last_cleanup_at TIMESTAMP WITH TIME ZONE,
    cleanup_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Trail Alerts Table
CREATE TABLE IF NOT EXISTS audit_trail_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'integrity_failure', 'unusual_activity', 'data_tampering', 'export_unauthorized'
    alert_data JSONB NOT NULL, -- Alert-specific data
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Trail Analytics Table
CREATE TABLE IF NOT EXISTS audit_trail_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    total_audits INTEGER DEFAULT 0,
    create_audits INTEGER DEFAULT 0,
    update_audits INTEGER DEFAULT 0,
    delete_audits INTEGER DEFAULT 0,
    view_audits INTEGER DEFAULT 0,
    export_audits INTEGER DEFAULT 0,
    login_audits INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    integrity_failures INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_trails_company_id ON audit_trails(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_trails_entity_type ON audit_trails(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_trails_entity_id ON audit_trails(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_trails_action ON audit_trails(action);
CREATE INDEX IF NOT EXISTS idx_audit_trails_user_id ON audit_trails(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trails_created_at ON audit_trails(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_trails_audit_hash ON audit_trails(audit_hash);

CREATE INDEX IF NOT EXISTS idx_audit_trail_snapshots_company_id ON audit_trail_snapshots(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_snapshots_entity_type ON audit_trail_snapshots(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_trail_snapshots_entity_id ON audit_trail_snapshots(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_snapshots_created_at ON audit_trail_snapshots(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_trail_snapshots_hash ON audit_trail_snapshots(snapshot_hash);

CREATE INDEX IF NOT EXISTS idx_audit_trail_integrity_company_id ON audit_trail_integrity(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_integrity_audit_trail_id ON audit_trail_integrity(audit_trail_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_integrity_valid ON audit_trail_integrity(is_integrity_valid);
CREATE INDEX IF NOT EXISTS idx_audit_trail_integrity_verified_at ON audit_trail_integrity(verified_at);

CREATE INDEX IF NOT EXISTS idx_audit_trail_exports_company_id ON audit_trail_exports(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_exports_type ON audit_trail_exports(export_type);
CREATE INDEX IF NOT EXISTS idx_audit_trail_exports_created_at ON audit_trail_exports(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_trail_exports_hash ON audit_trail_exports(export_hash);

CREATE INDEX IF NOT EXISTS idx_audit_trail_retention_company_id ON audit_trail_retention(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_retention_policy ON audit_trail_retention(retention_policy);
CREATE INDEX IF NOT EXISTS idx_audit_trail_retention_active ON audit_trail_retention(is_active);

CREATE INDEX IF NOT EXISTS idx_audit_trail_alerts_company_id ON audit_trail_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_alerts_type ON audit_trail_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_audit_trail_alerts_severity ON audit_trail_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_audit_trail_alerts_resolved ON audit_trail_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_audit_trail_alerts_created_at ON audit_trail_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_trail_analytics_company_id ON audit_trail_analytics(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_analytics_analysis_date ON audit_trail_analytics(analysis_date);

-- Add foreign key constraints
ALTER TABLE audit_trails ADD CONSTRAINT fk_audit_trails_user 
    FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE audit_trail_integrity ADD CONSTRAINT fk_audit_trail_integrity_audit_trail 
    FOREIGN KEY (audit_trail_id) REFERENCES audit_trails(id);
ALTER TABLE audit_trail_integrity ADD CONSTRAINT fk_audit_trail_integrity_verified_by 
    FOREIGN KEY (verified_by) REFERENCES users(id);

ALTER TABLE audit_trail_exports ADD CONSTRAINT fk_audit_trail_exports_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE audit_trail_retention ADD CONSTRAINT fk_audit_trail_retention_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE audit_trail_alerts ADD CONSTRAINT fk_audit_trail_alerts_resolved_by 
    FOREIGN KEY (resolved_by) REFERENCES users(id);