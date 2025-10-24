-- ML Categorization Tables
-- This schema defines tables for storing ML categorization data, models, feedback, and performance metrics

-- ML Models Table
CREATE TABLE IF NOT EXISTS ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    model_type VARCHAR(50) NOT NULL, -- 'categorization', 'fraud_detection', 'churn_prediction'
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    model_data JSONB, -- Serialized model data
    model_metadata JSONB, -- Model configuration and parameters
    training_data JSONB, -- Training dataset information
    performance_metrics JSONB, -- Model performance metrics
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transaction Categorizations Table
CREATE TABLE IF NOT EXISTS transaction_categorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    method VARCHAR(20) NOT NULL, -- 'ml', 'rules', 'manual'
    ml_model_id UUID REFERENCES ml_models(id),
    rule_id UUID REFERENCES categorization_rules(id),
    features JSONB, -- Features used for ML prediction
    user_feedback VARCHAR(20), -- 'correct', 'incorrect', 'partial'
    corrected_category VARCHAR(100),
    feedback_confidence DECIMAL(5,4),
    feedback_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categorization Rules Table
CREATE TABLE IF NOT EXISTS categorization_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    rule_name VARCHAR(100) NOT NULL,
    rule_description TEXT,
    category VARCHAR(100) NOT NULL,
    conditions JSONB NOT NULL, -- Rule conditions array
    priority INTEGER DEFAULT 0, -- Higher priority rules are evaluated first
    confidence DECIMAL(5,4) DEFAULT 1.0000,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ML Feedback Table
CREATE TABLE IF NOT EXISTS ml_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    categorization_id UUID REFERENCES transaction_categorizations(id) ON DELETE CASCADE,
    feedback VARCHAR(20) NOT NULL, -- 'correct', 'incorrect', 'partial'
    corrected_category VARCHAR(100),
    confidence DECIMAL(5,4),
    feedback_notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ML Retraining Jobs Table
CREATE TABLE IF NOT EXISTS ml_retraining_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    model_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'pending', 'running', 'completed', 'failed'
    training_data JSONB, -- Training dataset
    model_parameters JSONB, -- Model training parameters
    performance_metrics JSONB, -- Training performance metrics
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ML Model Performance Table
CREATE TABLE IF NOT EXISTS ml_model_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    model_id UUID REFERENCES ml_models(id) ON DELETE CASCADE,
    metric_name VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,6) NOT NULL,
    metric_type VARCHAR(20) NOT NULL, -- 'accuracy', 'precision', 'recall', 'f1_score'
    category VARCHAR(100), -- Category-specific metrics
    evaluation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categorization Categories Table
CREATE TABLE IF NOT EXISTS categorization_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL,
    category_description TEXT,
    parent_category_id UUID REFERENCES categorization_categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categorization Templates Table
CREATE TABLE IF NOT EXISTS categorization_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_name VARCHAR(100) NOT NULL,
    template_description TEXT,
    template_rules JSONB NOT NULL, -- Template rule definitions
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categorization Analytics Table
CREATE TABLE IF NOT EXISTS categorization_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    total_categorizations INTEGER DEFAULT 0,
    ml_categorizations INTEGER DEFAULT 0,
    rules_categorizations INTEGER DEFAULT 0,
    manual_categorizations INTEGER DEFAULT 0,
    feedback_count INTEGER DEFAULT 0,
    correct_categorizations INTEGER DEFAULT 0,
    incorrect_categorizations INTEGER DEFAULT 0,
    avg_confidence DECIMAL(5,4) DEFAULT 0,
    avg_feedback_confidence DECIMAL(5,4) DEFAULT 0,
    accuracy_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ml_models_company_id ON ml_models(company_id);
CREATE INDEX IF NOT EXISTS idx_ml_models_type ON ml_models(model_type);
CREATE INDEX IF NOT EXISTS idx_ml_models_active ON ml_models(is_active);

CREATE INDEX IF NOT EXISTS idx_transaction_categorizations_company_id ON transaction_categorizations(company_id);
CREATE INDEX IF NOT EXISTS idx_transaction_categorizations_transaction_id ON transaction_categorizations(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_categorizations_category ON transaction_categorizations(category);
CREATE INDEX IF NOT EXISTS idx_transaction_categorizations_method ON transaction_categorizations(method);
CREATE INDEX IF NOT EXISTS idx_transaction_categorizations_confidence ON transaction_categorizations(confidence);
CREATE INDEX IF NOT EXISTS idx_transaction_categorizations_created_at ON transaction_categorizations(created_at);

CREATE INDEX IF NOT EXISTS idx_categorization_rules_company_id ON categorization_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_categorization_rules_category ON categorization_rules(category);
CREATE INDEX IF NOT EXISTS idx_categorization_rules_priority ON categorization_rules(priority);
CREATE INDEX IF NOT EXISTS idx_categorization_rules_active ON categorization_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_ml_feedback_company_id ON ml_feedback(company_id);
CREATE INDEX IF NOT EXISTS idx_ml_feedback_categorization_id ON ml_feedback(categorization_id);
CREATE INDEX IF NOT EXISTS idx_ml_feedback_feedback ON ml_feedback(feedback);
CREATE INDEX IF NOT EXISTS idx_ml_feedback_created_at ON ml_feedback(created_at);

CREATE INDEX IF NOT EXISTS idx_ml_retraining_jobs_company_id ON ml_retraining_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_ml_retraining_jobs_model_type ON ml_retraining_jobs(model_type);
CREATE INDEX IF NOT EXISTS idx_ml_retraining_jobs_status ON ml_retraining_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ml_retraining_jobs_created_at ON ml_retraining_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_ml_model_performance_company_id ON ml_model_performance(company_id);
CREATE INDEX IF NOT EXISTS idx_ml_model_performance_model_id ON ml_model_performance(model_id);
CREATE INDEX IF NOT EXISTS idx_ml_model_performance_metric_name ON ml_model_performance(metric_name);
CREATE INDEX IF NOT EXISTS idx_ml_model_performance_evaluation_date ON ml_model_performance(evaluation_date);

CREATE INDEX IF NOT EXISTS idx_categorization_categories_company_id ON categorization_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_categorization_categories_name ON categorization_categories(category_name);
CREATE INDEX IF NOT EXISTS idx_categorization_categories_parent ON categorization_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_categorization_categories_active ON categorization_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_categorization_templates_company_id ON categorization_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_categorization_templates_active ON categorization_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_categorization_analytics_company_id ON categorization_analytics(company_id);
CREATE INDEX IF NOT EXISTS idx_categorization_analytics_analysis_date ON categorization_analytics(analysis_date);

-- Add foreign key constraints
ALTER TABLE transaction_categorizations ADD CONSTRAINT fk_transaction_categorizations_ml_model 
    FOREIGN KEY (ml_model_id) REFERENCES ml_models(id);
ALTER TABLE transaction_categorizations ADD CONSTRAINT fk_transaction_categorizations_rule 
    FOREIGN KEY (rule_id) REFERENCES categorization_rules(id);

ALTER TABLE categorization_rules ADD CONSTRAINT fk_categorization_rules_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE ml_feedback ADD CONSTRAINT fk_ml_feedback_categorization 
    FOREIGN KEY (categorization_id) REFERENCES transaction_categorizations(id);
ALTER TABLE ml_feedback ADD CONSTRAINT fk_ml_feedback_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE ml_model_performance ADD CONSTRAINT fk_ml_model_performance_model 
    FOREIGN KEY (model_id) REFERENCES ml_models(id);

ALTER TABLE categorization_categories ADD CONSTRAINT fk_categorization_categories_parent 
    FOREIGN KEY (parent_category_id) REFERENCES categorization_categories(id);

ALTER TABLE categorization_templates ADD CONSTRAINT fk_categorization_templates_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);