-- Data Visualization Schema
-- This schema supports interactive charts, dashboards, and visualization templates

-- Chart Configurations Table
CREATE TABLE IF NOT EXISTS chart_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('line', 'bar', 'pie', 'area', 'scatter', 'heatmap', 'gauge', 'funnel', 'sankey', 'treemap')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    data_source VARCHAR(255) NOT NULL,
    query TEXT NOT NULL,
    x_axis JSONB NOT NULL DEFAULT '{}',
    y_axis JSONB NOT NULL DEFAULT '{}',
    series JSONB NOT NULL DEFAULT '[]',
    colors JSONB NOT NULL DEFAULT '[]',
    legend JSONB NOT NULL DEFAULT '{}',
    tooltip JSONB NOT NULL DEFAULT '{}',
    animation JSONB NOT NULL DEFAULT '{}',
    responsive BOOLEAN NOT NULL DEFAULT true,
    interactive BOOLEAN NOT NULL DEFAULT true,
    exportable BOOLEAN NOT NULL DEFAULT true,
    shareable BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_chart_configs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_chart_configs_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Dashboards Table
CREATE TABLE IF NOT EXISTS dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    layout JSONB NOT NULL DEFAULT '{}',
    charts JSONB NOT NULL DEFAULT '[]',
    filters JSONB NOT NULL DEFAULT '[]',
    permissions JSONB NOT NULL DEFAULT '{}',
    is_public BOOLEAN NOT NULL DEFAULT false,
    interactive BOOLEAN NOT NULL DEFAULT false,
    real_time BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_dashboards_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_dashboards_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Visualization Templates Table
CREATE TABLE IF NOT EXISTS visualization_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    sample_data JSONB NOT NULL DEFAULT '[]',
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_visualization_templates_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_visualization_templates_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Dashboard Views Table (for analytics)
CREATE TABLE IF NOT EXISTS dashboard_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL,
    viewer_id UUID,
    view_duration INTEGER DEFAULT 0,
    last_viewed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_dashboard_views_dashboard FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE,
    CONSTRAINT fk_dashboard_views_viewer FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Dashboard Shares Table
CREATE TABLE IF NOT EXISTS dashboard_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL,
    shared_with UUID NOT NULL,
    permission VARCHAR(50) NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'admin')),
    shared_by UUID NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_dashboard_shares_dashboard FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE,
    CONSTRAINT fk_dashboard_shares_shared_with FOREIGN KEY (shared_with) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_dashboard_shares_shared_by FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(dashboard_id, shared_with)
);

-- Chart Insights Table
CREATE TABLE IF NOT EXISTS chart_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chart_id UUID NOT NULL,
    insight_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_chart_insights_chart FOREIGN KEY (chart_id) REFERENCES chart_configs(id) ON DELETE CASCADE
);

-- Chart Anomalies Table
CREATE TABLE IF NOT EXISTS chart_anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chart_id UUID NOT NULL,
    data_point JSONB NOT NULL,
    deviation DECIMAL(10,4) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_chart_anomalies_chart FOREIGN KEY (chart_id) REFERENCES chart_configs(id) ON DELETE CASCADE
);

-- Chart Trends Table
CREATE TABLE IF NOT EXISTS chart_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chart_id UUID NOT NULL,
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('increasing', 'decreasing', 'stable')),
    strength DECIMAL(5,4) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_chart_trends_chart FOREIGN KEY (chart_id) REFERENCES chart_configs(id) ON DELETE CASCADE
);

-- Chart Exports Table
CREATE TABLE IF NOT EXISTS chart_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chart_id UUID NOT NULL,
    format VARCHAR(20) NOT NULL CHECK (format IN ('png', 'svg', 'pdf', 'excel', 'csv')),
    file_path VARCHAR(500),
    file_size INTEGER,
    exported_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_chart_exports_chart FOREIGN KEY (chart_id) REFERENCES chart_configs(id) ON DELETE CASCADE,
    CONSTRAINT fk_chart_exports_exported_by FOREIGN KEY (exported_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Dashboard Filters Table
CREATE TABLE IF NOT EXISTS dashboard_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('date', 'number', 'text', 'select', 'multiselect', 'boolean')),
    field VARCHAR(255) NOT NULL,
    operator VARCHAR(50) NOT NULL,
    default_value JSONB,
    options JSONB NOT NULL DEFAULT '[]',
    required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_dashboard_filters_dashboard FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE
);

-- Chart Comments Table
CREATE TABLE IF NOT EXISTS chart_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chart_id UUID NOT NULL,
    comment TEXT NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_chart_comments_chart FOREIGN KEY (chart_id) REFERENCES chart_configs(id) ON DELETE CASCADE,
    CONSTRAINT fk_chart_comments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Chart Versions Table (for version control)
CREATE TABLE IF NOT EXISTS chart_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chart_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    config JSONB NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_chart_versions_chart FOREIGN KEY (chart_id) REFERENCES chart_configs(id) ON DELETE CASCADE,
    CONSTRAINT fk_chart_versions_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(chart_id, version_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chart_configs_company ON chart_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_chart_configs_type ON chart_configs(type);
CREATE INDEX IF NOT EXISTS idx_chart_configs_created_by ON chart_configs(created_by);

CREATE INDEX IF NOT EXISTS idx_dashboards_company ON dashboards(company_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_created_by ON dashboards(created_by);
CREATE INDEX IF NOT EXISTS idx_dashboards_public ON dashboards(is_public);
CREATE INDEX IF NOT EXISTS idx_dashboards_interactive ON dashboards(interactive);

CREATE INDEX IF NOT EXISTS idx_visualization_templates_company ON visualization_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_visualization_templates_category ON visualization_templates(category);
CREATE INDEX IF NOT EXISTS idx_visualization_templates_type ON visualization_templates(type);
CREATE INDEX IF NOT EXISTS idx_visualization_templates_public ON visualization_templates(is_public);

CREATE INDEX IF NOT EXISTS idx_dashboard_views_dashboard ON dashboard_views(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_views_viewer ON dashboard_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_views_last_viewed ON dashboard_views(last_viewed);

CREATE INDEX IF NOT EXISTS idx_dashboard_shares_dashboard ON dashboard_shares(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_shares_shared_with ON dashboard_shares(shared_with);

CREATE INDEX IF NOT EXISTS idx_chart_insights_chart ON chart_insights(chart_id);
CREATE INDEX IF NOT EXISTS idx_chart_insights_type ON chart_insights(insight_type);

CREATE INDEX IF NOT EXISTS idx_chart_anomalies_chart ON chart_anomalies(chart_id);
CREATE INDEX IF NOT EXISTS idx_chart_anomalies_severity ON chart_anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_chart_anomalies_detected_at ON chart_anomalies(detected_at);

CREATE INDEX IF NOT EXISTS idx_chart_trends_chart ON chart_trends(chart_id);
CREATE INDEX IF NOT EXISTS idx_chart_trends_direction ON chart_trends(direction);
CREATE INDEX IF NOT EXISTS idx_chart_trends_period ON chart_trends(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_chart_exports_chart ON chart_exports(chart_id);
CREATE INDEX IF NOT EXISTS idx_chart_exports_format ON chart_exports(format);

CREATE INDEX IF NOT EXISTS idx_dashboard_filters_dashboard ON dashboard_filters(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_filters_type ON dashboard_filters(type);

CREATE INDEX IF NOT EXISTS idx_chart_comments_chart ON chart_comments(chart_id);

CREATE INDEX IF NOT EXISTS idx_chart_versions_chart ON chart_versions(chart_id);
CREATE INDEX IF NOT EXISTS idx_chart_versions_version ON chart_versions(chart_id, version_number);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chart_configs_updated_at BEFORE UPDATE ON chart_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chart_comments_updated_at BEFORE UPDATE ON chart_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();








