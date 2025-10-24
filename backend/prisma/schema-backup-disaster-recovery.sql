-- Backup & Disaster Recovery Schema
-- This schema supports backup strategies, disaster recovery plans, high availability, and recovery operations

-- Backup Strategies Table
CREATE TABLE IF NOT EXISTS backup_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('scheduled', 'continuous', 'on-demand', 'incremental', 'full')),
    schedule VARCHAR(100) NOT NULL,
    retention_days INTEGER NOT NULL DEFAULT 30,
    encryption_enabled BOOLEAN NOT NULL DEFAULT true,
    compression_enabled BOOLEAN NOT NULL DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'paused')),
    last_backup TIMESTAMP WITH TIME ZONE,
    next_backup TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_backup_strategies_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Disaster Recovery Plans Table
CREATE TABLE IF NOT EXISTS disaster_recovery_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rto INTEGER NOT NULL, -- Recovery Time Objective in minutes
    rpo INTEGER NOT NULL, -- Recovery Point Objective in minutes
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    components JSONB NOT NULL DEFAULT '[]',
    procedures JSONB NOT NULL DEFAULT '[]',
    contacts JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'testing', 'failed')),
    last_tested TIMESTAMP WITH TIME ZONE,
    next_test TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_disaster_recovery_plans_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Backup Jobs Table
CREATE TABLE IF NOT EXISTS backup_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('full', 'incremental', 'differential')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- Duration in milliseconds
    size BIGINT, -- Size in bytes
    compressed_size BIGINT, -- Compressed size in bytes
    files_count INTEGER,
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_backup_jobs_strategy FOREIGN KEY (strategy_id) REFERENCES backup_strategies(id) ON DELETE CASCADE
);

-- Recovery Points Table
CREATE TABLE IF NOT EXISTS recovery_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_job_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('full', 'incremental', 'differential')),
    size BIGINT NOT NULL,
    location VARCHAR(500) NOT NULL,
    checksum VARCHAR(255) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    retention_until TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_recovery_points_backup_job FOREIGN KEY (backup_job_id) REFERENCES backup_jobs(id) ON DELETE CASCADE
);

-- High Availability Configurations Table
CREATE TABLE IF NOT EXISTS high_availability_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('active-passive', 'active-active', 'multi-master')),
    primary_region VARCHAR(100) NOT NULL,
    secondary_regions JSONB NOT NULL DEFAULT '[]',
    failover_mode VARCHAR(50) NOT NULL CHECK (failover_mode IN ('automatic', 'manual', 'scheduled')),
    health_checks JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'failover')),
    last_failover TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_high_availability_configs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- DR Tests Table
CREATE TABLE IF NOT EXISTS dr_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL,
    test_type VARCHAR(50) NOT NULL CHECK (test_type IN ('full', 'partial', 'tabletop')),
    status VARCHAR(50) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'passed', 'failed', 'cancelled')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- Duration in milliseconds
    results JSONB NOT NULL DEFAULT '{}',
    issues JSONB NOT NULL DEFAULT '[]',
    recommendations JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_dr_tests_plan FOREIGN KEY (plan_id) REFERENCES disaster_recovery_plans(id) ON DELETE CASCADE
);

-- Failover Events Table
CREATE TABLE IF NOT EXISTS failover_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL,
    target_region VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'rolled_back')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- Duration in milliseconds
    reason VARCHAR(255),
    details JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_failover_events_config FOREIGN KEY (config_id) REFERENCES high_availability_configs(id) ON DELETE CASCADE
);

-- Restore Operations Table
CREATE TABLE IF NOT EXISTS restore_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recovery_point_id UUID NOT NULL,
    target_location VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- Duration in milliseconds
    restored_files INTEGER,
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_restore_operations_recovery_point FOREIGN KEY (recovery_point_id) REFERENCES recovery_points(id) ON DELETE CASCADE
);

-- Backup Storage Table
CREATE TABLE IF NOT EXISTS backup_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('s3', 'gcs', 'azure-blob', 'local', 'nfs')),
    config JSONB NOT NULL DEFAULT '{}',
    total_capacity BIGINT,
    used_capacity BIGINT,
    available_capacity BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_backup_storage_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Backup Retention Policies Table
CREATE TABLE IF NOT EXISTS backup_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    policy_type VARCHAR(50) NOT NULL CHECK (policy_type IN ('time-based', 'count-based', 'size-based')),
    retention_period INTEGER NOT NULL, -- Days, count, or size in bytes
    cleanup_schedule VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    last_cleanup TIMESTAMP WITH TIME ZONE,
    next_cleanup TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_backup_retention_policies_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Backup Monitoring Table
CREATE TABLE IF NOT EXISTS backup_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(50) NOT NULL,
    threshold_warning DECIMAL(15,4),
    threshold_critical DECIMAL(15,4),
    alert_enabled BOOLEAN NOT NULL DEFAULT true,
    last_alert TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_backup_monitoring_strategy FOREIGN KEY (strategy_id) REFERENCES backup_strategies(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_backup_strategies_company ON backup_strategies(company_id);
CREATE INDEX IF NOT EXISTS idx_backup_strategies_type ON backup_strategies(type);
CREATE INDEX IF NOT EXISTS idx_backup_strategies_status ON backup_strategies(status);
CREATE INDEX IF NOT EXISTS idx_backup_strategies_next_backup ON backup_strategies(next_backup);

CREATE INDEX IF NOT EXISTS idx_disaster_recovery_plans_company ON disaster_recovery_plans(company_id);
CREATE INDEX IF NOT EXISTS idx_disaster_recovery_plans_priority ON disaster_recovery_plans(priority);
CREATE INDEX IF NOT EXISTS idx_disaster_recovery_plans_status ON disaster_recovery_plans(status);
CREATE INDEX IF NOT EXISTS idx_disaster_recovery_plans_next_test ON disaster_recovery_plans(next_test);

CREATE INDEX IF NOT EXISTS idx_backup_jobs_strategy ON backup_jobs(strategy_id);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_status ON backup_jobs(status);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_start_time ON backup_jobs(start_time);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_type ON backup_jobs(type);

CREATE INDEX IF NOT EXISTS idx_recovery_points_backup_job ON recovery_points(backup_job_id);
CREATE INDEX IF NOT EXISTS idx_recovery_points_timestamp ON recovery_points(timestamp);
CREATE INDEX IF NOT EXISTS idx_recovery_points_type ON recovery_points(type);
CREATE INDEX IF NOT EXISTS idx_recovery_points_verified ON recovery_points(verified);
CREATE INDEX IF NOT EXISTS idx_recovery_points_retention ON recovery_points(retention_until);

CREATE INDEX IF NOT EXISTS idx_high_availability_configs_company ON high_availability_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_high_availability_configs_type ON high_availability_configs(type);
CREATE INDEX IF NOT EXISTS idx_high_availability_configs_status ON high_availability_configs(status);

CREATE INDEX IF NOT EXISTS idx_dr_tests_plan ON dr_tests(plan_id);
CREATE INDEX IF NOT EXISTS idx_dr_tests_status ON dr_tests(status);
CREATE INDEX IF NOT EXISTS idx_dr_tests_start_time ON dr_tests(start_time);

CREATE INDEX IF NOT EXISTS idx_failover_events_config ON failover_events(config_id);
CREATE INDEX IF NOT EXISTS idx_failover_events_status ON failover_events(status);
CREATE INDEX IF NOT EXISTS idx_failover_events_start_time ON failover_events(start_time);

CREATE INDEX IF NOT EXISTS idx_restore_operations_recovery_point ON restore_operations(recovery_point_id);
CREATE INDEX IF NOT EXISTS idx_restore_operations_status ON restore_operations(status);
CREATE INDEX IF NOT EXISTS idx_restore_operations_start_time ON restore_operations(start_time);

CREATE INDEX IF NOT EXISTS idx_backup_storage_company ON backup_storage(company_id);
CREATE INDEX IF NOT EXISTS idx_backup_storage_type ON backup_storage(type);
CREATE INDEX IF NOT EXISTS idx_backup_storage_status ON backup_storage(status);

CREATE INDEX IF NOT EXISTS idx_backup_retention_policies_company ON backup_retention_policies(company_id);
CREATE INDEX IF NOT EXISTS idx_backup_retention_policies_type ON backup_retention_policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_backup_retention_policies_status ON backup_retention_policies(status);

CREATE INDEX IF NOT EXISTS idx_backup_monitoring_strategy ON backup_monitoring(strategy_id);
CREATE INDEX IF NOT EXISTS idx_backup_monitoring_metric ON backup_monitoring(metric_name);
CREATE INDEX IF NOT EXISTS idx_backup_monitoring_created_at ON backup_monitoring(created_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_backup_strategies_updated_at BEFORE UPDATE ON backup_strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disaster_recovery_plans_updated_at BEFORE UPDATE ON disaster_recovery_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_high_availability_configs_updated_at BEFORE UPDATE ON high_availability_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backup_storage_updated_at BEFORE UPDATE ON backup_storage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backup_retention_policies_updated_at BEFORE UPDATE ON backup_retention_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();





