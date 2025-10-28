-- Predictive Analytics Database Schema
-- This schema supports ML models, predictions, and forecasting

-- ML Models table
CREATE TABLE ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN ('regression', 'classification', 'clustering', 'time_series')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('training', 'ready', 'deployed', 'failed')),
    accuracy DECIMAL(5,4),
    precision_score DECIMAL(5,4),
    recall_score DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    model_version VARCHAR(20) NOT NULL,
    features JSONB NOT NULL,
    hyperparameters JSONB NOT NULL,
    model_data BYTEA,
    training_data_size INTEGER,
    last_trained TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model predictions storage
CREATE TABLE model_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    input_data JSONB NOT NULL,
    prediction JSONB NOT NULL,
    confidence_score DECIMAL(5,4),
    probability DECIMAL(5,4),
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time series forecasts
CREATE TABLE time_series_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    forecast_period VARCHAR(20) NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_value DECIMAL(15,2) NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL,
    lower_bound DECIMAL(15,2),
    upper_bound DECIMAL(15,2),
    seasonality_detected BOOLEAN DEFAULT FALSE,
    seasonality_strength DECIMAL(5,4),
    trend_direction VARCHAR(10) CHECK (trend_direction IN ('up', 'down', 'stable')),
    trend_strength DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anomaly detection results
CREATE TABLE anomaly_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    detection_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_value DECIMAL(15,2) NOT NULL,
    expected_value DECIMAL(15,2) NOT NULL,
    anomaly_score DECIMAL(10,4) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    recommended_action TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer segmentation results
CREATE TABLE customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    segment_name VARCHAR(100) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    segment_characteristics JSONB NOT NULL,
    segment_score DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model training history
CREATE TABLE model_training_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    training_started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    training_completed_at TIMESTAMP WITH TIME ZONE,
    training_status VARCHAR(20) NOT NULL CHECK (training_status IN ('started', 'completed', 'failed')),
    training_data_size INTEGER,
    accuracy_before DECIMAL(5,4),
    accuracy_after DECIMAL(5,4),
    training_duration_seconds INTEGER,
    error_message TEXT,
    hyperparameters_used JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model performance metrics
CREATE TABLE model_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    evaluation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_period_start DATE,
    data_period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prediction feedback for model improvement
CREATE TABLE prediction_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID NOT NULL REFERENCES model_predictions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('correct', 'incorrect', 'partially_correct')),
    feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 5),
    feedback_comment TEXT,
    actual_outcome JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model deployment tracking
CREATE TABLE model_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    deployment_version VARCHAR(20) NOT NULL,
    deployment_status VARCHAR(20) NOT NULL CHECK (deployment_status IN ('pending', 'deployed', 'failed', 'rolled_back')),
    deployed_at TIMESTAMP WITH TIME ZONE,
    deployed_by UUID REFERENCES users(id),
    rollback_reason TEXT,
    performance_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature importance tracking
CREATE TABLE feature_importance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    importance_score DECIMAL(10,6) NOT NULL,
    feature_type VARCHAR(50),
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model drift detection
CREATE TABLE model_drift_detection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    drift_type VARCHAR(50) NOT NULL,
    drift_score DECIMAL(10,6) NOT NULL,
    drift_threshold DECIMAL(10,6) NOT NULL,
    is_drift_detected BOOLEAN NOT NULL,
    detection_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_period_start TIMESTAMP WITH TIME ZONE,
    data_period_end TIMESTAMP WITH TIME ZONE,
    drift_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ml_models_company_status ON ml_models(company_id, status);
CREATE INDEX idx_ml_models_type ON ml_models(model_type);
CREATE INDEX idx_ml_models_last_trained ON ml_models(last_trained);
CREATE INDEX idx_model_predictions_company_model ON model_predictions(company_id, model_id);
CREATE INDEX idx_model_predictions_created_at ON model_predictions(created_at);
CREATE INDEX idx_time_series_forecasts_company_metric ON time_series_forecasts(company_id, metric_name);
CREATE INDEX idx_time_series_forecasts_forecast_date ON time_series_forecasts(forecast_date);
CREATE INDEX idx_anomaly_detections_company_severity ON anomaly_detections(company_id, severity);
CREATE INDEX idx_anomaly_detections_timestamp ON anomaly_detections(detection_timestamp);
CREATE INDEX idx_anomaly_detections_unresolved ON anomaly_detections(company_id, is_resolved) WHERE is_resolved = FALSE;
CREATE INDEX idx_customer_segments_company_segment ON customer_segments(company_id, segment_name);
CREATE INDEX idx_customer_segments_customer ON customer_segments(customer_id);
CREATE INDEX idx_model_training_history_model ON model_training_history(model_id);
CREATE INDEX idx_model_training_history_status ON model_training_history(training_status);
CREATE INDEX idx_model_performance_metrics_model ON model_performance_metrics(model_id);
CREATE INDEX idx_model_performance_metrics_date ON model_performance_metrics(evaluation_date);
CREATE INDEX idx_prediction_feedback_prediction ON prediction_feedback(prediction_id);
CREATE INDEX idx_model_deployments_model_status ON model_deployments(model_id, deployment_status);
CREATE INDEX idx_feature_importance_model ON feature_importance(model_id);
CREATE INDEX idx_model_drift_detection_model ON model_drift_detection(model_id);
CREATE INDEX idx_model_drift_detection_date ON model_drift_detection(detection_date);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ml_models_updated_at 
    BEFORE UPDATE ON ml_models 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common analytics queries
CREATE VIEW model_performance_summary AS
SELECT 
    mm.company_id,
    mm.model_name,
    mm.model_type,
    mm.status,
    mm.accuracy,
    mm.last_trained,
    COUNT(mp.id) as total_predictions,
    AVG(mp.confidence_score) as avg_confidence,
    COUNT(pf.id) as feedback_count,
    AVG(pf.feedback_score) as avg_feedback_score
FROM ml_models mm
LEFT JOIN model_predictions mp ON mm.id = mp.model_id
LEFT JOIN prediction_feedback pf ON mp.id = pf.prediction_id
GROUP BY mm.id, mm.company_id, mm.model_name, mm.model_type, mm.status, mm.accuracy, mm.last_trained;

CREATE VIEW anomaly_summary AS
SELECT 
    company_id,
    metric_name,
    COUNT(*) as total_anomalies,
    COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_anomalies,
    COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_anomalies,
    COUNT(CASE WHEN is_resolved = TRUE THEN 1 END) as resolved_anomalies,
    AVG(anomaly_score) as avg_anomaly_score,
    MAX(detection_timestamp) as latest_anomaly
FROM anomaly_detections
GROUP BY company_id, metric_name;

CREATE VIEW forecast_accuracy AS
SELECT 
    tsf.company_id,
    tsf.metric_name,
    tsf.model_id,
    AVG(tsf.confidence_score) as avg_confidence,
    COUNT(*) as forecast_count,
    MIN(tsf.forecast_date) as earliest_forecast,
    MAX(tsf.forecast_date) as latest_forecast
FROM time_series_forecasts tsf
GROUP BY tsf.company_id, tsf.metric_name, tsf.model_id;

-- Create materialized views for complex analytics
CREATE MATERIALIZED VIEW customer_segment_analysis AS
SELECT 
    cs.company_id,
    cs.segment_name,
    COUNT(DISTINCT cs.customer_id) as customer_count,
    AVG(cs.segment_score) as avg_segment_score,
    SUM(t.amount) as total_revenue,
    AVG(t.amount) as avg_transaction_value,
    COUNT(t.id) as total_transactions
FROM customer_segments cs
LEFT JOIN customers c ON cs.customer_id = c.id
LEFT JOIN transactions t ON c.id = t.customer_id
GROUP BY cs.company_id, cs.segment_name;

-- Create index on materialized view
CREATE INDEX idx_customer_segment_analysis_company_segment ON customer_segment_analysis(company_id, segment_name);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO verigrade_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO verigrade_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO verigrade_app;








