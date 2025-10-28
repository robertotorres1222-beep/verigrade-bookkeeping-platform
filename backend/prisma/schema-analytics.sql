-- Analytics and AI Database Schema
-- This schema supports predictive analytics, ML models, business intelligence, and advanced reporting

-- ML Models table
CREATE TABLE ml_models (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('classification', 'regression', 'clustering', 'anomaly_detection') NOT NULL,
    status ENUM('training', 'trained', 'deployed', 'failed') NOT NULL DEFAULT 'training',
    accuracy DECIMAL(5,4) DEFAULT 0.0000,
    confidence DECIMAL(5,4) DEFAULT 0.0000,
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    parameters JSON,
    performance JSON,
    last_trained TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ML Training Data table
CREATE TABLE ml_training_data (
    id VARCHAR(255) PRIMARY KEY,
    model_id VARCHAR(255) NOT NULL,
    features JSON NOT NULL,
    label VARCHAR(255) NOT NULL,
    weight DECIMAL(5,4) DEFAULT 1.0000,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES ml_models(id) ON DELETE CASCADE
);

-- ML Predictions table
CREATE TABLE ml_predictions (
    id VARCHAR(255) PRIMARY KEY,
    model_id VARCHAR(255) NOT NULL,
    input JSON NOT NULL,
    prediction JSON NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    probability DECIMAL(5,4),
    explanation TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES ml_models(id) ON DELETE CASCADE
);

-- Dashboards table
CREATE TABLE dashboards (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    widgets JSON,
    layout JSON,
    filters JSON,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Reports table
CREATE TABLE reports (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('financial', 'operational', 'customer', 'custom') NOT NULL,
    template JSON,
    data JSON,
    filters JSON,
    schedule JSON,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Report Templates table
CREATE TABLE report_templates (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    sections JSON,
    layout JSON,
    styling JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Report Executions table
CREATE TABLE report_executions (
    id VARCHAR(255) PRIMARY KEY,
    report_id VARCHAR(255) NOT NULL,
    status ENUM('pending', 'running', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration INTEGER,
    error TEXT,
    result JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Report Shares table
CREATE TABLE report_shares (
    id VARCHAR(255) PRIMARY KEY,
    report_id VARCHAR(255) NOT NULL,
    share_token VARCHAR(255) UNIQUE NOT NULL,
    recipients JSON,
    permissions ENUM('view', 'edit', 'admin') NOT NULL DEFAULT 'view',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Report Builders table
CREATE TABLE report_builders (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    data_sources JSON,
    fields JSON,
    relationships JSON,
    calculated_fields JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- KPIs table
CREATE TABLE kpis (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    target DECIMAL(15,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    trend ENUM('up', 'down', 'stable') NOT NULL,
    change DECIMAL(15,2) NOT NULL,
    period VARCHAR(50) NOT NULL,
    category ENUM('financial', 'operational', 'customer', 'growth') NOT NULL,
    description TEXT,
    status ENUM('good', 'warning', 'critical') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Performance Metrics table
CREATE TABLE performance_metrics (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    previous_value DECIMAL(15,2) NOT NULL,
    change DECIMAL(15,2) NOT NULL,
    change_percent DECIMAL(5,2) NOT NULL,
    trend ENUM('up', 'down', 'stable') NOT NULL,
    period VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status ENUM('good', 'warning', 'critical') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Benchmarks table
CREATE TABLE benchmarks (
    id VARCHAR(255) PRIMARY KEY,
    metric VARCHAR(255) NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    percentile INTEGER NOT NULL,
    description TEXT,
    source VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market Insights table
CREATE TABLE market_insights (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('trend', 'opportunity', 'threat', 'regulation') NOT NULL,
    impact ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    source VARCHAR(255) NOT NULL,
    recommendations JSON,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Competitive Analysis table
CREATE TABLE competitive_analysis (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    competitor VARCHAR(255) NOT NULL,
    market_share DECIMAL(5,2) NOT NULL,
    strengths JSON,
    weaknesses JSON,
    opportunities JSON,
    threats JSON,
    score INTEGER NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Cash Flow Forecasts table
CREATE TABLE cash_flow_forecasts (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    predicted_inflow DECIMAL(15,2) NOT NULL,
    predicted_outflow DECIMAL(15,2) NOT NULL,
    predicted_balance DECIMAL(15,2) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    factors JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Revenue Predictions table
CREATE TABLE revenue_predictions (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    period VARCHAR(50) NOT NULL,
    predicted_revenue DECIMAL(15,2) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    trend ENUM('increasing', 'decreasing', 'stable') NOT NULL,
    factors JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Expense Trends table
CREATE TABLE expense_trends (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    current_amount DECIMAL(15,2) NOT NULL,
    predicted_amount DECIMAL(15,2) NOT NULL,
    trend ENUM('increasing', 'decreasing', 'stable') NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    recommendations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Anomaly Detections table
CREATE TABLE anomaly_detections (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    type ENUM('expense', 'revenue', 'transaction', 'pattern') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    description TEXT NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    expected_value DECIMAL(15,2) NOT NULL,
    deviation DECIMAL(5,2) NOT NULL,
    recommendations JSON,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Risk Assessments table
CREATE TABLE risk_assessments (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    category ENUM('financial', 'operational', 'market', 'compliance') NOT NULL,
    risk_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    description TEXT NOT NULL,
    probability DECIMAL(5,4) NOT NULL,
    impact DECIMAL(5,4) NOT NULL,
    mitigation JSON,
    monitoring JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Seasonal Patterns table
CREATE TABLE seasonal_patterns (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    pattern VARCHAR(255) NOT NULL,
    strength DECIMAL(5,4) NOT NULL,
    frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
    description TEXT NOT NULL,
    examples JSON,
    recommendations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_ml_models_status ON ml_models(status);
CREATE INDEX idx_ml_models_type ON ml_models(type);
CREATE INDEX idx_ml_training_data_model_id ON ml_training_data(model_id);
CREATE INDEX idx_ml_predictions_model_id ON ml_predictions(model_id);
CREATE INDEX idx_ml_predictions_timestamp ON ml_predictions(timestamp);
CREATE INDEX idx_dashboards_company_id ON dashboards(company_id);
CREATE INDEX idx_reports_company_id ON reports(company_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_report_executions_report_id ON report_executions(report_id);
CREATE INDEX idx_report_executions_status ON report_executions(status);
CREATE INDEX idx_report_shares_share_token ON report_shares(share_token);
CREATE INDEX idx_report_builders_company_id ON report_builders(company_id);
CREATE INDEX idx_kpis_company_id ON kpis(company_id);
CREATE INDEX idx_kpis_category ON kpis(category);
CREATE INDEX idx_performance_metrics_company_id ON performance_metrics(company_id);
CREATE INDEX idx_performance_metrics_category ON performance_metrics(category);
CREATE INDEX idx_benchmarks_industry ON benchmarks(industry);
CREATE INDEX idx_market_insights_company_id ON market_insights(company_id);
CREATE INDEX idx_market_insights_category ON market_insights(category);
CREATE INDEX idx_competitive_analysis_company_id ON competitive_analysis(company_id);
CREATE INDEX idx_cash_flow_forecasts_company_id ON cash_flow_forecasts(company_id);
CREATE INDEX idx_cash_flow_forecasts_date ON cash_flow_forecasts(date);
CREATE INDEX idx_revenue_predictions_company_id ON revenue_predictions(company_id);
CREATE INDEX idx_expense_trends_company_id ON expense_trends(company_id);
CREATE INDEX idx_anomaly_detections_company_id ON anomaly_detections(company_id);
CREATE INDEX idx_anomaly_detections_severity ON anomaly_detections(severity);
CREATE INDEX idx_risk_assessments_company_id ON risk_assessments(company_id);
CREATE INDEX idx_risk_assessments_risk_level ON risk_assessments(risk_level);
CREATE INDEX idx_seasonal_patterns_company_id ON seasonal_patterns(company_id);










