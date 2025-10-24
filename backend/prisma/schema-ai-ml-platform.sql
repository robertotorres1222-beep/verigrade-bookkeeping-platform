-- AI & ML Platform Schema
-- This schema supports comprehensive AI/ML platform management including
-- model training, deployment, monitoring, drift detection, experiments,
-- feature store, pipelines, and analytics for enterprise ML operations

-- ML Models table
CREATE TABLE IF NOT EXISTS ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CLASSIFICATION', 'REGRESSION', 'CLUSTERING', 'DEEP_LEARNING', 'NLP', 'COMPUTER_VISION', 'TIME_SERIES', 'ANOMALY_DETECTION')),
    algorithm VARCHAR(255) NOT NULL,
    version VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'TRAINING' CHECK (status IN ('TRAINING', 'TRAINED', 'DEPLOYED', 'FAILED', 'ARCHIVED')),
    accuracy DECIMAL(5,4),
    precision DECIMAL(5,4),
    recall DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    training_data JSONB NOT NULL, -- Training data configuration
    hyperparameters JSONB NOT NULL, -- Model hyperparameters
    model_path VARCHAR(500) NOT NULL,
    metrics JSONB NOT NULL, -- Model performance metrics
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model Training table
CREATE TABLE IF NOT EXISTS model_training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    training_data JSONB NOT NULL, -- Training data used
    hyperparameters JSONB NOT NULL, -- Training hyperparameters
    metrics JSONB NOT NULL, -- Training metrics
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration INTEGER, -- Duration in seconds
    error TEXT,
    logs TEXT[] NOT NULL, -- Training logs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model Deployments table
CREATE TABLE IF NOT EXISTS model_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    environment VARCHAR(20) NOT NULL CHECK (environment IN ('DEVELOPMENT', 'STAGING', 'PRODUCTION')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DEPLOYING', 'DEPLOYED', 'FAILED', 'ROLLED_BACK')),
    endpoint VARCHAR(500) NOT NULL,
    version VARCHAR(20) NOT NULL,
    replicas INTEGER NOT NULL DEFAULT 1,
    resources JSONB NOT NULL, -- Resource configuration
    health_check JSONB NOT NULL, -- Health check configuration
    monitoring JSONB NOT NULL, -- Monitoring configuration
    deployed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model Predictions table
CREATE TABLE IF NOT EXISTS model_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    input JSONB NOT NULL, -- Input data
    output JSONB NOT NULL, -- Prediction output
    confidence DECIMAL(5,4) NOT NULL,
    processing_time INTEGER NOT NULL, -- Processing time in milliseconds
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'TIMEOUT')),
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model Monitoring table
CREATE TABLE IF NOT EXISTS model_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    metric VARCHAR(255) NOT NULL,
    value DECIMAL(15,6) NOT NULL,
    threshold DECIMAL(15,6),
    status VARCHAR(20) DEFAULT 'NORMAL' CHECK (status IN ('NORMAL', 'WARNING', 'CRITICAL')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB NOT NULL
);

-- Model Drift table
CREATE TABLE IF NOT EXISTS model_drift (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    feature VARCHAR(255) NOT NULL,
    drift_score DECIMAL(5,4) NOT NULL,
    p_value DECIMAL(5,4) NOT NULL,
    threshold DECIMAL(5,4) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('NORMAL', 'DRIFT_DETECTED', 'CRITICAL_DRIFT')),
    baseline_data JSONB NOT NULL,
    current_data JSONB NOT NULL,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model Performance table
CREATE TABLE IF NOT EXISTS model_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    metric VARCHAR(255) NOT NULL,
    value DECIMAL(15,6) NOT NULL,
    baseline DECIMAL(15,6) NOT NULL,
    change DECIMAL(15,6) NOT NULL,
    change_percent DECIMAL(5,2) NOT NULL,
    period VARCHAR(20) NOT NULL CHECK (period IN ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model Experiments table
CREATE TABLE IF NOT EXISTS model_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    models TEXT[] NOT NULL, -- Array of model IDs
    metrics JSONB NOT NULL, -- Experiment metrics
    best_model VARCHAR(255), -- Best performing model ID
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration INTEGER, -- Duration in seconds
    results JSONB NOT NULL, -- Experiment results
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model Registry table
CREATE TABLE IF NOT EXISTS model_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    version VARCHAR(20) NOT NULL,
    stage VARCHAR(20) DEFAULT 'NONE' CHECK (stage IN ('NONE', 'STAGING', 'PRODUCTION', 'ARCHIVED')),
    tags TEXT[] NOT NULL,
    metadata JSONB NOT NULL,
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model Serving table
CREATE TABLE IF NOT EXISTS model_serving (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    endpoint VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR')),
    requests BIGINT NOT NULL DEFAULT 0,
    latency DECIMAL(8,2) NOT NULL DEFAULT 0,
    throughput DECIMAL(8,2) NOT NULL DEFAULT 0,
    error_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    last_request TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model Feature Store table
CREATE TABLE IF NOT EXISTS model_feature_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('NUMERICAL', 'CATEGORICAL', 'TEXT', 'IMAGE', 'AUDIO', 'VIDEO')),
    data_type VARCHAR(50) NOT NULL,
    schema JSONB NOT NULL,
    source VARCHAR(500) NOT NULL,
    transformations JSONB NOT NULL, -- Feature transformations
    validation JSONB NOT NULL, -- Validation rules
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model Pipelines table
CREATE TABLE IF NOT EXISTS model_pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'FAILED')),
    steps JSONB NOT NULL, -- Pipeline steps
    schedule JSONB, -- Schedule configuration
    triggers JSONB NOT NULL, -- Pipeline triggers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ml_models_type ON ml_models(type);
CREATE INDEX IF NOT EXISTS idx_ml_models_status ON ml_models(status);
CREATE INDEX IF NOT EXISTS idx_ml_models_algorithm ON ml_models(algorithm);

CREATE INDEX IF NOT EXISTS idx_model_training_model ON model_training(model_id);
CREATE INDEX IF NOT EXISTS idx_model_training_status ON model_training(status);
CREATE INDEX IF NOT EXISTS idx_model_training_start_time ON model_training(start_time);

CREATE INDEX IF NOT EXISTS idx_model_deployments_model ON model_deployments(model_id);
CREATE INDEX IF NOT EXISTS idx_model_deployments_environment ON model_deployments(environment);
CREATE INDEX IF NOT EXISTS idx_model_deployments_status ON model_deployments(status);

CREATE INDEX IF NOT EXISTS idx_model_predictions_model ON model_predictions(model_id);
CREATE INDEX IF NOT EXISTS idx_model_predictions_status ON model_predictions(status);
CREATE INDEX IF NOT EXISTS idx_model_predictions_created ON model_predictions(created_at);

CREATE INDEX IF NOT EXISTS idx_model_monitoring_model ON model_monitoring(model_id);
CREATE INDEX IF NOT EXISTS idx_model_monitoring_metric ON model_monitoring(metric);
CREATE INDEX IF NOT EXISTS idx_model_monitoring_timestamp ON model_monitoring(timestamp);

CREATE INDEX IF NOT EXISTS idx_model_drift_model ON model_drift(model_id);
CREATE INDEX IF NOT EXISTS idx_model_drift_feature ON model_drift(feature);
CREATE INDEX IF NOT EXISTS idx_model_drift_status ON model_drift(status);
CREATE INDEX IF NOT EXISTS idx_model_drift_detected ON model_drift(detected_at);

CREATE INDEX IF NOT EXISTS idx_model_performance_model ON model_performance(model_id);
CREATE INDEX IF NOT EXISTS idx_model_performance_metric ON model_performance(metric);
CREATE INDEX IF NOT EXISTS idx_model_performance_period ON model_performance(period);
CREATE INDEX IF NOT EXISTS idx_model_performance_timestamp ON model_performance(timestamp);

CREATE INDEX IF NOT EXISTS idx_model_experiments_status ON model_experiments(status);
CREATE INDEX IF NOT EXISTS idx_model_experiments_start_time ON model_experiments(start_time);

CREATE INDEX IF NOT EXISTS idx_model_registry_model ON model_registry(model_id);
CREATE INDEX IF NOT EXISTS idx_model_registry_stage ON model_registry(stage);
CREATE INDEX IF NOT EXISTS idx_model_registry_version ON model_registry(version);

CREATE INDEX IF NOT EXISTS idx_model_serving_model ON model_serving(model_id);
CREATE INDEX IF NOT EXISTS idx_model_serving_status ON model_serving(status);

CREATE INDEX IF NOT EXISTS idx_model_feature_store_type ON model_feature_store(type);

CREATE INDEX IF NOT EXISTS idx_model_pipelines_status ON model_pipelines(status);

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_ai_ml_platform_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ml_model_updated_at
    BEFORE UPDATE ON ml_models
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_ml_platform_updated_at();

CREATE TRIGGER trigger_update_model_training_updated_at
    BEFORE UPDATE ON model_training
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_ml_platform_updated_at();

CREATE TRIGGER trigger_update_model_deployment_updated_at
    BEFORE UPDATE ON model_deployments
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_ml_platform_updated_at();

CREATE TRIGGER trigger_update_model_experiment_updated_at
    BEFORE UPDATE ON model_experiments
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_ml_platform_updated_at();

CREATE TRIGGER trigger_update_model_registry_updated_at
    BEFORE UPDATE ON model_registry
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_ml_platform_updated_at();

CREATE TRIGGER trigger_update_model_serving_updated_at
    BEFORE UPDATE ON model_serving
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_ml_platform_updated_at();

CREATE TRIGGER trigger_update_model_feature_store_updated_at
    BEFORE UPDATE ON model_feature_store
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_ml_platform_updated_at();

CREATE TRIGGER trigger_update_model_pipeline_updated_at
    BEFORE UPDATE ON model_pipelines
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_ml_platform_updated_at();

-- Create function to update model serving metrics
CREATE OR REPLACE FUNCTION update_model_serving_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update serving metrics when a prediction is made
    UPDATE model_serving 
    SET 
        requests = requests + 1,
        latency = (latency * requests + NEW.processing_time) / (requests + 1),
        throughput = requests / EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 3600,
        error_rate = CASE 
            WHEN NEW.status = 'SUCCESS' THEN error_rate
            ELSE (error_rate * requests + 1) / (requests + 1)
        END,
        last_request = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE model_id = NEW.model_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_model_serving_metrics
    AFTER INSERT ON model_predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_model_serving_metrics();

-- Create function to detect model drift
CREATE OR REPLACE FUNCTION detect_model_drift()
RETURNS TRIGGER AS $$
DECLARE
    drift_score DECIMAL(5,4);
    p_value DECIMAL(5,4);
    threshold DECIMAL(5,4) := 0.05;
    status VARCHAR(20);
BEGIN
    -- Calculate drift score (simplified example)
    drift_score := ABS(NEW.value - OLD.value) / OLD.value;
    p_value := 1 - drift_score; -- Simplified p-value calculation
    
    IF drift_score > threshold THEN
        status := 'DRIFT_DETECTED';
    ELSE
        status := 'NORMAL';
    END IF;
    
    -- Insert drift detection record
    INSERT INTO model_drift (
        model_id, feature, drift_score, p_value, threshold, status,
        baseline_data, current_data, detected_at
    ) VALUES (
        NEW.model_id, NEW.metric, drift_score, p_value, threshold, status,
        jsonb_build_object('value', OLD.value, 'timestamp', OLD.timestamp),
        jsonb_build_object('value', NEW.value, 'timestamp', NEW.timestamp),
        CURRENT_TIMESTAMP
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_detect_model_drift
    AFTER UPDATE ON model_monitoring
    FOR EACH ROW
    WHEN (OLD.value IS DISTINCT FROM NEW.value)
    EXECUTE FUNCTION detect_model_drift();

-- Create function to calculate model performance metrics
CREATE OR REPLACE FUNCTION calculate_model_performance()
RETURNS TRIGGER AS $$
DECLARE
    baseline_value DECIMAL(15,6);
    change_value DECIMAL(15,6);
    change_percent DECIMAL(5,2);
BEGIN
    -- Get baseline value (previous period)
    SELECT value INTO baseline_value
    FROM model_performance 
    WHERE model_id = NEW.model_id 
    AND metric = NEW.metric 
    AND period = NEW.period
    ORDER BY timestamp DESC 
    LIMIT 1;
    
    IF baseline_value IS NULL THEN
        baseline_value := NEW.value;
    END IF;
    
    change_value := NEW.value - baseline_value;
    change_percent := (change_value / baseline_value) * 100;
    
    -- Update the record with calculated values
    UPDATE model_performance 
    SET 
        baseline = baseline_value,
        change = change_value,
        change_percent = change_percent
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_model_performance
    AFTER INSERT ON model_performance
    FOR EACH ROW
    EXECUTE FUNCTION calculate_model_performance();

-- Create function to update model training duration
CREATE OR REPLACE FUNCTION update_training_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('COMPLETED', 'FAILED', 'CANCELLED') AND OLD.status = 'RUNNING' THEN
        NEW.duration := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_training_duration
    BEFORE UPDATE ON model_training
    FOR EACH ROW
    EXECUTE FUNCTION update_training_duration();

-- Create function to update model experiment duration
CREATE OR REPLACE FUNCTION update_experiment_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('COMPLETED', 'FAILED', 'CANCELLED') AND OLD.status = 'RUNNING' THEN
        NEW.duration := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_experiment_duration
    BEFORE UPDATE ON model_experiments
    FOR EACH ROW
    EXECUTE FUNCTION update_experiment_duration();

-- Create function to generate daily model performance summary
CREATE OR REPLACE FUNCTION generate_daily_model_performance()
RETURNS TRIGGER AS $$
DECLARE
    model_id UUID;
    metric_name VARCHAR(255);
    avg_value DECIMAL(15,6);
    max_value DECIMAL(15,6);
    min_value DECIMAL(15,6);
    count_value INTEGER;
BEGIN
    -- Generate daily performance summary for each model and metric
    FOR model_id, metric_name IN 
        SELECT DISTINCT model_id, metric 
        FROM model_monitoring 
        WHERE DATE(timestamp) = CURRENT_DATE
    LOOP
        SELECT 
            AVG(value), MAX(value), MIN(value), COUNT(*)
        INTO avg_value, max_value, min_value, count_value
        FROM model_monitoring 
        WHERE model_id = model_id 
        AND metric = metric_name 
        AND DATE(timestamp) = CURRENT_DATE;
        
        -- Insert daily performance record
        INSERT INTO model_performance (
            model_id, metric, value, baseline, change, change_percent, period, timestamp
        ) VALUES (
            model_id, metric_name, avg_value, avg_value, 0, 0, 'DAILY', CURRENT_TIMESTAMP
        ) ON CONFLICT DO NOTHING;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old monitoring data
CREATE OR REPLACE FUNCTION cleanup_old_monitoring_data()
RETURNS VOID AS $$
BEGIN
    -- Delete monitoring data older than 90 days
    DELETE FROM model_monitoring 
    WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '90 days';
    
    -- Delete old predictions older than 30 days
    DELETE FROM model_predictions 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    -- Delete old drift data older than 180 days
    DELETE FROM model_drift 
    WHERE detected_at < CURRENT_TIMESTAMP - INTERVAL '180 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to get model health score
CREATE OR REPLACE FUNCTION get_model_health_score(model_id_param UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    health_score DECIMAL(5,2) := 100.0;
    drift_count INTEGER;
    error_rate DECIMAL(5,2);
    latency_avg DECIMAL(8,2);
BEGIN
    -- Check for drift
    SELECT COUNT(*) INTO drift_count
    FROM model_drift 
    WHERE model_id = model_id_param 
    AND status = 'DRIFT_DETECTED'
    AND detected_at > CURRENT_TIMESTAMP - INTERVAL '7 days';
    
    IF drift_count > 0 THEN
        health_score := health_score - (drift_count * 10);
    END IF;
    
    -- Check error rate
    SELECT error_rate INTO error_rate
    FROM model_serving 
    WHERE model_id = model_id_param;
    
    IF error_rate > 5 THEN
        health_score := health_score - (error_rate * 2);
    END IF;
    
    -- Check latency
    SELECT latency INTO latency_avg
    FROM model_serving 
    WHERE model_id = model_id_param;
    
    IF latency_avg > 1000 THEN
        health_score := health_score - ((latency_avg - 1000) / 100);
    END IF;
    
    -- Ensure health score is between 0 and 100
    health_score := GREATEST(0, LEAST(100, health_score));
    
    RETURN health_score;
END;
$$ LANGUAGE plpgsql;




