-- API Platform Schema
-- This schema supports comprehensive API platform management including
-- API keys, webhooks, integrations, SDKs, API versions, developer portal,
-- and analytics for a complete developer ecosystem

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    key VARCHAR(255) NOT NULL UNIQUE,
    secret VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    permissions TEXT[] NOT NULL,
    rate_limit JSONB NOT NULL, -- { requests: number, window: string }
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'REVOKED')),
    last_used TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    events TEXT[] NOT NULL,
    secret VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'FAILED')),
    retry_policy JSONB NOT NULL, -- { maxRetries: number, backoffMultiplier: number, timeout: number }
    filters JSONB, -- Event filters
    headers JSONB, -- Custom headers
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhook Deliveries table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DELIVERED', 'FAILED', 'RETRYING')),
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL,
    next_retry_at TIMESTAMP,
    delivered_at TIMESTAMP,
    response JSONB, -- Response details
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('ACCOUNTING', 'CRM', 'E_COMMERCE', 'PAYMENT', 'COMMUNICATION', 'PRODUCTIVITY', 'ANALYTICS', 'OTHER')),
    provider VARCHAR(255) NOT NULL,
    version VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED')),
    pricing JSONB NOT NULL, -- Pricing information
    features TEXT[] NOT NULL,
    requirements TEXT[] NOT NULL,
    documentation TEXT NOT NULL,
    support JSONB NOT NULL, -- Support information
    oauth JSONB, -- OAuth configuration
    api_endpoints JSONB NOT NULL, -- API endpoints
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Integration Installations table
CREATE TABLE IF NOT EXISTS integration_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'INSTALLING', 'ACTIVE', 'FAILED', 'UNINSTALLED')),
    configuration JSONB NOT NULL,
    credentials JSONB NOT NULL,
    permissions TEXT[] NOT NULL,
    installed_at TIMESTAMP,
    last_sync_at TIMESTAMP,
    sync_status VARCHAR(20) DEFAULT 'PENDING' CHECK (sync_status IN ('SUCCESS', 'FAILED', 'IN_PROGRESS', 'PENDING')),
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SDKs table
CREATE TABLE IF NOT EXISTS sdks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    language VARCHAR(20) NOT NULL CHECK (language IN ('JAVASCRIPT', 'PYTHON', 'PHP', 'RUBY', 'JAVA', 'C_SHARP', 'GO', 'SWIFT', 'KOTLIN')),
    version VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DEPRECATED', 'BETA')),
    description TEXT NOT NULL,
    features TEXT[] NOT NULL,
    installation TEXT NOT NULL,
    documentation TEXT NOT NULL,
    examples JSONB NOT NULL, -- Code examples
    download_url VARCHAR(500) NOT NULL,
    repository_url VARCHAR(500),
    package_manager VARCHAR(50) NOT NULL,
    dependencies JSONB NOT NULL, -- SDK dependencies
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Versions table
CREATE TABLE IF NOT EXISTS api_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'BETA' CHECK (status IN ('BETA', 'STABLE', 'DEPRECATED', 'SUNSET')),
    release_date DATE NOT NULL,
    sunset_date DATE,
    changelog TEXT NOT NULL,
    breaking_changes TEXT[] NOT NULL,
    new_features TEXT[] NOT NULL,
    improvements TEXT[] NOT NULL,
    bug_fixes TEXT[] NOT NULL,
    documentation TEXT NOT NULL,
    migration_guide TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Analytics table
CREATE TABLE IF NOT EXISTS api_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    total_requests BIGINT NOT NULL DEFAULT 0,
    successful_requests BIGINT NOT NULL DEFAULT 0,
    failed_requests BIGINT NOT NULL DEFAULT 0,
    average_response_time DECIMAL(8,2) NOT NULL DEFAULT 0,
    p95_response_time DECIMAL(8,2) NOT NULL DEFAULT 0,
    p99_response_time DECIMAL(8,2) NOT NULL DEFAULT 0,
    unique_users INTEGER NOT NULL DEFAULT 0,
    top_endpoints JSONB NOT NULL, -- Top endpoints data
    error_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    bandwidth BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Developer Portal table
CREATE TABLE IF NOT EXISTS developer_portal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('GUIDE', 'TUTORIAL', 'REFERENCE', 'CHANGELOG', 'FAQ')),
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    tags TEXT[] NOT NULL,
    author UUID NOT NULL,
    published_at TIMESTAMP,
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires ON api_keys(expires_at);

CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_status ON webhooks(status);
CREATE INDEX IF NOT EXISTS idx_webhooks_events ON webhooks USING GIN(events);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event ON webhook_deliveries(event);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created ON webhook_deliveries(created_at);

CREATE INDEX IF NOT EXISTS idx_integrations_category ON integrations(category);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);

CREATE INDEX IF NOT EXISTS idx_integration_installations_integration ON integration_installations(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_installations_user ON integration_installations(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_installations_status ON integration_installations(status);

CREATE INDEX IF NOT EXISTS idx_sdks_language ON sdks(language);
CREATE INDEX IF NOT EXISTS idx_sdks_status ON sdks(status);

CREATE INDEX IF NOT EXISTS idx_api_versions_status ON api_versions(status);
CREATE INDEX IF NOT EXISTS idx_api_versions_release_date ON api_versions(release_date);

CREATE INDEX IF NOT EXISTS idx_api_analytics_date ON api_analytics(date);

CREATE INDEX IF NOT EXISTS idx_developer_portal_category ON developer_portal(category);
CREATE INDEX IF NOT EXISTS idx_developer_portal_status ON developer_portal(status);
CREATE INDEX IF NOT EXISTS idx_developer_portal_author ON developer_portal(author);
CREATE INDEX IF NOT EXISTS idx_developer_portal_published ON developer_portal(published_at);

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_api_platform_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_api_key_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_api_platform_updated_at();

CREATE TRIGGER trigger_update_webhook_updated_at
    BEFORE UPDATE ON webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_api_platform_updated_at();

CREATE TRIGGER trigger_update_webhook_delivery_updated_at
    BEFORE UPDATE ON webhook_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_api_platform_updated_at();

CREATE TRIGGER trigger_update_integration_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_api_platform_updated_at();

CREATE TRIGGER trigger_update_integration_installation_updated_at
    BEFORE UPDATE ON integration_installations
    FOR EACH ROW
    EXECUTE FUNCTION update_api_platform_updated_at();

CREATE TRIGGER trigger_update_sdk_updated_at
    BEFORE UPDATE ON sdks
    FOR EACH ROW
    EXECUTE FUNCTION update_api_platform_updated_at();

CREATE TRIGGER trigger_update_api_version_updated_at
    BEFORE UPDATE ON api_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_api_platform_updated_at();

CREATE TRIGGER trigger_update_developer_portal_updated_at
    BEFORE UPDATE ON developer_portal
    FOR EACH ROW
    EXECUTE FUNCTION update_api_platform_updated_at();

-- Create function to update API key last used
CREATE OR REPLACE FUNCTION update_api_key_last_used()
RETURNS TRIGGER AS $$
BEGIN
    -- This would be called when an API request is made
    -- For now, we'll create a placeholder function
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to process webhook deliveries
CREATE OR REPLACE FUNCTION process_webhook_delivery()
RETURNS TRIGGER AS $$
BEGIN
    -- This would be called to process webhook deliveries
    -- For now, we'll create a placeholder function
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate daily API analytics
CREATE OR REPLACE FUNCTION generate_daily_api_analytics()
RETURNS TRIGGER AS $$
DECLARE
    analytics_date DATE;
    total_requests BIGINT;
    successful_requests BIGINT;
    failed_requests BIGINT;
    average_response_time DECIMAL(8,2);
    p95_response_time DECIMAL(8,2);
    p99_response_time DECIMAL(8,2);
    unique_users INTEGER;
    top_endpoints JSONB;
    error_rate DECIMAL(5,2);
    bandwidth BIGINT;
BEGIN
    analytics_date := CURRENT_DATE;
    
    -- Calculate analytics (this would be based on actual API usage data)
    total_requests := 1000 + (RANDOM() * 5000)::BIGINT;
    successful_requests := total_requests - (RANDOM() * 100)::BIGINT;
    failed_requests := total_requests - successful_requests;
    average_response_time := 100 + (RANDOM() * 200);
    p95_response_time := 200 + (RANDOM() * 300);
    p99_response_time := 300 + (RANDOM() * 400);
    unique_users := 50 + (RANDOM() * 200)::INTEGER;
    top_endpoints := '[
        {"endpoint": "/api/v1/users", "requests": 500, "averageResponseTime": 150},
        {"endpoint": "/api/v1/transactions", "requests": 300, "averageResponseTime": 200},
        {"endpoint": "/api/v1/reports", "requests": 200, "averageResponseTime": 300}
    ]'::JSONB;
    error_rate := (failed_requests::DECIMAL / total_requests) * 100;
    bandwidth := total_requests * (100 + RANDOM() * 1000);
    
    -- Insert or update analytics
    INSERT INTO api_analytics (
        date, total_requests, successful_requests, failed_requests,
        average_response_time, p95_response_time, p99_response_time,
        unique_users, top_endpoints, error_rate, bandwidth
    ) VALUES (
        analytics_date, total_requests, successful_requests, failed_requests,
        average_response_time, p95_response_time, p99_response_time,
        unique_users, top_endpoints, error_rate, bandwidth
    )
    ON CONFLICT (date) DO UPDATE SET
        total_requests = EXCLUDED.total_requests,
        successful_requests = EXCLUDED.successful_requests,
        failed_requests = EXCLUDED.failed_requests,
        average_response_time = EXCLUDED.average_response_time,
        p95_response_time = EXCLUDED.p95_response_time,
        p99_response_time = EXCLUDED.p99_response_time,
        unique_users = EXCLUDED.unique_users,
        top_endpoints = EXCLUDED.top_endpoints,
        error_rate = EXCLUDED.error_rate,
        bandwidth = EXCLUDED.bandwidth;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update developer portal content views
CREATE OR REPLACE FUNCTION update_content_views()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment view count when content is accessed
    UPDATE developer_portal 
    SET views = views + 1 
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle integration installation status
CREATE OR REPLACE FUNCTION handle_integration_installation()
RETURNS TRIGGER AS $$
BEGIN
    -- Update installation status based on configuration
    IF NEW.status = 'INSTALLING' THEN
        -- Simulate installation process
        UPDATE integration_installations 
        SET status = 'ACTIVE', installed_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_handle_integration_installation
    AFTER UPDATE ON integration_installations
    FOR EACH ROW
    EXECUTE FUNCTION handle_integration_installation();

-- Create function to handle webhook delivery retries
CREATE OR REPLACE FUNCTION handle_webhook_retry()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle webhook delivery retries
    IF NEW.status = 'FAILED' AND NEW.attempts < NEW.max_attempts THEN
        NEW.status := 'RETRYING';
        NEW.next_retry_at := CURRENT_TIMESTAMP + INTERVAL '1 minute' * POWER(2, NEW.attempts);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_handle_webhook_retry
    BEFORE UPDATE ON webhook_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION handle_webhook_retry();




