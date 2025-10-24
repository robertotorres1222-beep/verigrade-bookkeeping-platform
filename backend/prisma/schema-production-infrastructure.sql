-- Production Infrastructure Schema
-- This schema supports Kubernetes, Helm charts, secrets management, load balancing, and auto-scaling

-- Kubernetes Clusters Table
CREATE TABLE IF NOT EXISTS kubernetes_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('aws', 'gcp', 'azure', 'on-premise')),
    region VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    node_count INTEGER NOT NULL DEFAULT 3,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'error')),
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_kubernetes_clusters_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Helm Charts Table
CREATE TABLE IF NOT EXISTS helm_charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    repository VARCHAR(500) NOT NULL,
    namespace VARCHAR(100) NOT NULL DEFAULT 'default',
    values JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('deployed', 'pending', 'failed', 'upgrading')),
    deployed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_helm_charts_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Secrets Table
CREATE TABLE IF NOT EXISTS secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    namespace VARCHAR(100) NOT NULL DEFAULT 'default',
    type VARCHAR(50) NOT NULL CHECK (type IN ('kubernetes', 'aws-secrets-manager', 'vault', 'azure-key-vault')),
    data JSONB NOT NULL DEFAULT '{}',
    encrypted BOOLEAN NOT NULL DEFAULT true,
    rotation_enabled BOOLEAN NOT NULL DEFAULT false,
    last_rotated TIMESTAMP WITH TIME ZONE,
    next_rotation TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_secrets_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Load Balancers Table
CREATE TABLE IF NOT EXISTS load_balancers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('nginx', 'haproxy', 'aws-alb', 'gcp-lb', 'azure-lb')),
    config JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    endpoints JSONB NOT NULL DEFAULT '[]',
    health_checks JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_load_balancers_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Auto Scaling Configurations Table
CREATE TABLE IF NOT EXISTS auto_scaling_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('hpa', 'vpa', 'cluster-autoscaler')),
    target VARCHAR(255) NOT NULL,
    min_replicas INTEGER NOT NULL DEFAULT 1,
    max_replicas INTEGER NOT NULL DEFAULT 10,
    metrics JSONB NOT NULL DEFAULT '[]',
    policies JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_auto_scaling_configs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Service Meshes Table
CREATE TABLE IF NOT EXISTS service_meshes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('istio', 'linkerd', 'consul')),
    status VARCHAR(50) NOT NULL DEFAULT 'deploying' CHECK (status IN ('deploying', 'active', 'error', 'inactive')),
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_service_meshes_cluster FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(id) ON DELETE CASCADE
);

-- Monitoring Configurations Table
CREATE TABLE IF NOT EXISTS monitoring_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID NOT NULL,
    prometheus_enabled BOOLEAN NOT NULL DEFAULT true,
    grafana_enabled BOOLEAN NOT NULL DEFAULT true,
    jaeger_enabled BOOLEAN NOT NULL DEFAULT true,
    elasticsearch_enabled BOOLEAN NOT NULL DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_monitoring_configs_cluster FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(id) ON DELETE CASCADE
);

-- Backup Strategies Table
CREATE TABLE IF NOT EXISTS backup_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    strategy_type VARCHAR(50) NOT NULL CHECK (strategy_type IN ('scheduled', 'continuous', 'on-demand')),
    schedule VARCHAR(100) NOT NULL,
    retention_days INTEGER NOT NULL DEFAULT 30,
    encryption_enabled BOOLEAN NOT NULL DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_backup_strategies_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Pods Table (for cluster monitoring)
CREATE TABLE IF NOT EXISTS pods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    namespace VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('running', 'pending', 'failed', 'succeeded')),
    cpu_usage DECIMAL(10,4),
    memory_usage DECIMAL(10,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_pods_cluster FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(id) ON DELETE CASCADE
);

-- Services Table (for cluster monitoring)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    namespace VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('ClusterIP', 'NodePort', 'LoadBalancer', 'ExternalName')),
    port INTEGER NOT NULL,
    target_port INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_services_cluster FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(id) ON DELETE CASCADE
);

-- Ingress Controllers Table
CREATE TABLE IF NOT EXISTS ingress_controllers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('nginx', 'traefik', 'haproxy', 'aws-alb', 'gcp-lb')),
    config JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_ingress_controllers_cluster FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(id) ON DELETE CASCADE
);

-- Network Policies Table
CREATE TABLE IF NOT EXISTS network_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    namespace VARCHAR(100) NOT NULL,
    policy JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_network_policies_cluster FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(id) ON DELETE CASCADE
);

-- Resource Quotas Table
CREATE TABLE IF NOT EXISTS resource_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID NOT NULL,
    namespace VARCHAR(100) NOT NULL,
    cpu_limit DECIMAL(10,4),
    memory_limit DECIMAL(10,4),
    storage_limit DECIMAL(10,4),
    pod_limit INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_resource_quotas_cluster FOREIGN KEY (cluster_id) REFERENCES kubernetes_clusters(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kubernetes_clusters_company ON kubernetes_clusters(company_id);
CREATE INDEX IF NOT EXISTS idx_kubernetes_clusters_provider ON kubernetes_clusters(provider);
CREATE INDEX IF NOT EXISTS idx_kubernetes_clusters_status ON kubernetes_clusters(status);

CREATE INDEX IF NOT EXISTS idx_helm_charts_company ON helm_charts(company_id);
CREATE INDEX IF NOT EXISTS idx_helm_charts_status ON helm_charts(status);
CREATE INDEX IF NOT EXISTS idx_helm_charts_namespace ON helm_charts(namespace);

CREATE INDEX IF NOT EXISTS idx_secrets_company ON secrets(company_id);
CREATE INDEX IF NOT EXISTS idx_secrets_type ON secrets(type);
CREATE INDEX IF NOT EXISTS idx_secrets_namespace ON secrets(namespace);
CREATE INDEX IF NOT EXISTS idx_secrets_rotation ON secrets(rotation_enabled);

CREATE INDEX IF NOT EXISTS idx_load_balancers_company ON load_balancers(company_id);
CREATE INDEX IF NOT EXISTS idx_load_balancers_type ON load_balancers(type);
CREATE INDEX IF NOT EXISTS idx_load_balancers_status ON load_balancers(status);

CREATE INDEX IF NOT EXISTS idx_auto_scaling_configs_company ON auto_scaling_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_auto_scaling_configs_type ON auto_scaling_configs(type);
CREATE INDEX IF NOT EXISTS idx_auto_scaling_configs_status ON auto_scaling_configs(status);

CREATE INDEX IF NOT EXISTS idx_service_meshes_cluster ON service_meshes(cluster_id);
CREATE INDEX IF NOT EXISTS idx_service_meshes_type ON service_meshes(type);
CREATE INDEX IF NOT EXISTS idx_service_meshes_status ON service_meshes(status);

CREATE INDEX IF NOT EXISTS idx_monitoring_configs_cluster ON monitoring_configs(cluster_id);

CREATE INDEX IF NOT EXISTS idx_backup_strategies_company ON backup_strategies(company_id);
CREATE INDEX IF NOT EXISTS idx_backup_strategies_type ON backup_strategies(strategy_type);

CREATE INDEX IF NOT EXISTS idx_pods_cluster ON pods(cluster_id);
CREATE INDEX IF NOT EXISTS idx_pods_status ON pods(status);
CREATE INDEX IF NOT EXISTS idx_pods_namespace ON pods(namespace);

CREATE INDEX IF NOT EXISTS idx_services_cluster ON services(cluster_id);
CREATE INDEX IF NOT EXISTS idx_services_type ON services(type);
CREATE INDEX IF NOT EXISTS idx_services_namespace ON services(namespace);

CREATE INDEX IF NOT EXISTS idx_ingress_controllers_cluster ON ingress_controllers(cluster_id);
CREATE INDEX IF NOT EXISTS idx_ingress_controllers_type ON ingress_controllers(type);

CREATE INDEX IF NOT EXISTS idx_network_policies_cluster ON network_policies(cluster_id);
CREATE INDEX IF NOT EXISTS idx_network_policies_namespace ON network_policies(namespace);

CREATE INDEX IF NOT EXISTS idx_resource_quotas_cluster ON resource_quotas(cluster_id);
CREATE INDEX IF NOT EXISTS idx_resource_quotas_namespace ON resource_quotas(namespace);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_kubernetes_clusters_updated_at BEFORE UPDATE ON kubernetes_clusters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_helm_charts_updated_at BEFORE UPDATE ON helm_charts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_secrets_updated_at BEFORE UPDATE ON secrets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_load_balancers_updated_at BEFORE UPDATE ON load_balancers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_auto_scaling_configs_updated_at BEFORE UPDATE ON auto_scaling_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_meshes_updated_at BEFORE UPDATE ON service_meshes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monitoring_configs_updated_at BEFORE UPDATE ON monitoring_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backup_strategies_updated_at BEFORE UPDATE ON backup_strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pods_updated_at BEFORE UPDATE ON pods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ingress_controllers_updated_at BEFORE UPDATE ON ingress_controllers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_network_policies_updated_at BEFORE UPDATE ON network_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resource_quotas_updated_at BEFORE UPDATE ON resource_quotas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();





