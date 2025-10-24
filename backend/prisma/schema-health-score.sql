-- Financial Health Score Database Schema
-- This schema supports the financial health scoring system

-- Financial Health Score table
CREATE TABLE financial_health_scores (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    liquidity_score INTEGER NOT NULL CHECK (liquidity_score >= 0 AND liquidity_score <= 100),
    growth_score INTEGER NOT NULL CHECK (growth_score >= 0 AND growth_score <= 100),
    profitability_score INTEGER NOT NULL CHECK (profitability_score >= 0 AND profitability_score <= 100),
    efficiency_score INTEGER NOT NULL CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
    retention_score INTEGER NOT NULL CHECK (retention_score >= 0 AND retention_score <= 100),
    
    -- Detailed metrics
    cash_runway DECIMAL(10,2),
    current_ratio DECIMAL(5,2),
    quick_ratio DECIMAL(5,2),
    mrr_growth DECIMAL(5,2),
    customer_growth DECIMAL(5,2),
    pipeline_health DECIMAL(5,2),
    gross_margin DECIMAL(5,2),
    path_to_breakeven INTEGER,
    burn_multiple DECIMAL(5,2),
    cac_payback DECIMAL(5,2),
    magic_number DECIMAL(5,2),
    rule_of_40 DECIMAL(5,2),
    gross_retention DECIMAL(5,2),
    net_retention DECIMAL(5,2),
    churn_trend DECIMAL(5,2),
    
    -- Peer comparison data
    peer_comparison JSON,
    recommendations JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_created (company_id, created_at),
    INDEX idx_overall_score (overall_score),
    INDEX idx_created_at (created_at)
);

-- Health Score Alerts table
CREATE TABLE health_score_alerts (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    alert_type ENUM('score_drop', 'category_warning', 'peer_comparison', 'recommendation') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(100),
    old_score INTEGER,
    new_score INTEGER,
    threshold_value DECIMAL(10,2),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_alert (company_id, is_read),
    INDEX idx_alert_type (alert_type),
    INDEX idx_severity (severity)
);

-- Health Score Benchmarks table
CREATE TABLE health_score_benchmarks (
    id VARCHAR(255) PRIMARY KEY,
    industry VARCHAR(100) NOT NULL,
    company_size ENUM('startup', 'small', 'medium', 'large', 'enterprise') NOT NULL,
    revenue_range VARCHAR(50) NOT NULL,
    
    -- Industry benchmarks
    avg_overall_score INTEGER NOT NULL,
    avg_liquidity_score INTEGER NOT NULL,
    avg_growth_score INTEGER NOT NULL,
    avg_profitability_score INTEGER NOT NULL,
    avg_efficiency_score INTEGER NOT NULL,
    avg_retention_score INTEGER NOT NULL,
    
    -- Top quartile benchmarks
    top_quartile_overall INTEGER NOT NULL,
    top_quartile_liquidity INTEGER NOT NULL,
    top_quartile_growth INTEGER NOT NULL,
    top_quartile_profitability INTEGER NOT NULL,
    top_quartile_efficiency INTEGER NOT NULL,
    top_quartile_retention INTEGER NOT NULL,
    
    sample_size INTEGER NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_benchmark (industry, company_size, revenue_range),
    INDEX idx_industry_size (industry, company_size)
);

-- Health Score Recommendations table
CREATE TABLE health_score_recommendations (
    id VARCHAR(255) PRIMARY KEY,
    category ENUM('liquidity', 'growth', 'profitability', 'efficiency', 'retention') NOT NULL,
    score_range_min INTEGER NOT NULL,
    score_range_max INTEGER NOT NULL,
    recommendation_text TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high') NOT NULL,
    estimated_impact VARCHAR(100),
    implementation_effort ENUM('low', 'medium', 'high') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_category_score (category, score_range_min, score_range_max),
    INDEX idx_priority (priority)
);

-- Insert default benchmarks
INSERT INTO health_score_benchmarks (
    id, industry, company_size, revenue_range,
    avg_overall_score, avg_liquidity_score, avg_growth_score, 
    avg_profitability_score, avg_efficiency_score, avg_retention_score,
    top_quartile_overall, top_quartile_liquidity, top_quartile_growth,
    top_quartile_profitability, top_quartile_efficiency, top_quartile_retention,
    sample_size
) VALUES 
('saas-startup-0-1m', 'SaaS', 'startup', '0-1M', 65, 70, 60, 55, 65, 70, 85, 90, 80, 75, 85, 85, 150),
('saas-small-1-10m', 'SaaS', 'small', '1-10M', 72, 75, 70, 65, 75, 75, 88, 92, 85, 80, 90, 88, 200),
('saas-medium-10-50m', 'SaaS', 'medium', '10-50M', 78, 80, 75, 70, 80, 80, 90, 95, 88, 85, 92, 90, 180),
('ecommerce-startup-0-1m', 'E-commerce', 'startup', '0-1M', 60, 65, 55, 50, 60, 65, 80, 85, 75, 70, 80, 80, 120),
('fintech-medium-10-50m', 'Fintech', 'medium', '10-50M', 75, 78, 72, 68, 78, 78, 88, 92, 85, 82, 88, 88, 100);

-- Insert default recommendations
INSERT INTO health_score_recommendations (
    id, category, score_range_min, score_range_max, recommendation_text, 
    priority, estimated_impact, implementation_effort
) VALUES 
('liquidity-low-1', 'liquidity', 0, 40, 'Reduce monthly burn rate by 20-30% through cost optimization', 'high', 'Improve runway by 3-6 months', 'medium'),
('liquidity-low-2', 'liquidity', 0, 40, 'Raise additional capital to extend runway to 18+ months', 'high', 'Extend runway by 12+ months', 'high'),
('liquidity-medium-1', 'liquidity', 41, 70, 'Optimize working capital management and payment terms', 'medium', 'Improve cash position by 10-15%', 'low'),
('growth-low-1', 'growth', 0, 40, 'Increase marketing spend and improve conversion rates', 'high', 'Increase MRR growth by 5-10%', 'medium'),
('growth-low-2', 'growth', 0, 40, 'Improve sales pipeline management and lead qualification', 'high', 'Increase close rate by 15-25%', 'medium'),
('profitability-low-1', 'profitability', 0, 40, 'Increase pricing by 10-20% and optimize unit economics', 'high', 'Improve gross margin by 5-15%', 'medium'),
('profitability-low-2', 'profitability', 0, 40, 'Reduce operational costs through automation and efficiency', 'high', 'Reduce burn by 15-25%', 'high'),
('efficiency-low-1', 'efficiency', 0, 40, 'Improve sales efficiency and reduce CAC through better targeting', 'high', 'Reduce CAC payback by 3-6 months', 'medium'),
('efficiency-low-2', 'efficiency', 0, 40, 'Optimize marketing spend allocation across channels', 'medium', 'Improve magic number by 0.2-0.5', 'low'),
('retention-low-1', 'retention', 0, 40, 'Improve customer onboarding and success processes', 'high', 'Reduce churn by 2-5%', 'medium'),
('retention-low-2', 'retention', 0, 40, 'Increase expansion revenue through upselling and cross-selling', 'medium', 'Increase net retention by 10-20%', 'medium');






