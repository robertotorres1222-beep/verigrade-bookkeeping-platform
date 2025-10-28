-- Mobile Excellence Schema
-- This schema supports comprehensive mobile excellence including
-- mobile apps, features, offline sync, push notifications, biometric auth,
-- camera scanning, GPS tracking, voice commands, NFC scanning, AR capture,
-- watch companion, mobile widgets, deep linking, share extensions,
-- mobile analytics, performance, crashes, and feedback

-- Mobile Apps table
CREATE TABLE IF NOT EXISTS mobile_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('IOS', 'ANDROID', 'WEB', 'DESKTOP')),
    version VARCHAR(50) NOT NULL,
    build_number VARCHAR(50) NOT NULL,
    bundle_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DEPRECATED')),
    features TEXT[] NOT NULL,
    permissions TEXT[] NOT NULL,
    min_os_version VARCHAR(20) NOT NULL,
    target_os_version VARCHAR(20) NOT NULL,
    size BIGINT NOT NULL,
    download_url TEXT NOT NULL,
    release_notes TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mobile Features table
CREATE TABLE IF NOT EXISTS mobile_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('OFFLINE_SYNC', 'PUSH_NOTIFICATIONS', 'BIOMETRIC_AUTH', 'CAMERA_SCANNING', 'GPS_TRACKING', 'VOICE_COMMANDS', 'NFC_SCANNING', 'AR_CAPTURE', 'WATCH_COMPANION', 'WIDGETS', 'DEEP_LINKING', 'SHARE_EXTENSION')),
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('IOS', 'ANDROID', 'BOTH')),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    configuration JSONB NOT NULL,
    dependencies TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offline Sync table
CREATE TABLE IF NOT EXISTS offline_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('CREATE', 'UPDATE', 'DELETE')),
    data JSONB NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    synced BOOLEAN NOT NULL DEFAULT FALSE,
    sync_timestamp TIMESTAMP,
    conflict_resolution VARCHAR(20) NOT NULL CHECK (conflict_resolution IN ('SERVER_WINS', 'CLIENT_WINS', 'MANUAL', 'LAST_MODIFIED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Push Notifications table
CREATE TABLE IF NOT EXISTS push_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('INFO', 'WARNING', 'ERROR', 'SUCCESS', 'REMINDER', 'PROMOTION')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    clicked_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'READ', 'CLICKED', 'FAILED')),
    device_token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('IOS', 'ANDROID', 'WEB')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Biometric Auth table
CREATE TABLE IF NOT EXISTS biometric_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('FINGERPRINT', 'FACE_ID', 'TOUCH_ID', 'IRIS', 'VOICE')),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    device_id VARCHAR(255) NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('IOS', 'ANDROID')),
    registered_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Camera Scanning table
CREATE TABLE IF NOT EXISTS camera_scanning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('RECEIPT', 'INVOICE', 'DOCUMENT', 'QR_CODE', 'BARCODE', 'BUSINESS_CARD')),
    image_url TEXT NOT NULL,
    extracted_data JSONB NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    processing_time INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GPS Tracking table
CREATE TABLE IF NOT EXISTS gps_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    accuracy DECIMAL(8,2) NOT NULL,
    altitude DECIMAL(8,2),
    speed DECIMAL(8,2),
    heading DECIMAL(8,2),
    timestamp TIMESTAMP NOT NULL,
    purpose VARCHAR(50) NOT NULL CHECK (purpose IN ('MILEAGE_TRACKING', 'TIME_TRACKING', 'LOCATION_CHECK_IN', 'GEOFENCING')),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voice Commands table
CREATE TABLE IF NOT EXISTS voice_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    command TEXT NOT NULL,
    intent VARCHAR(100) NOT NULL,
    parameters JSONB NOT NULL,
    response TEXT NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    language VARCHAR(10) NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('IOS', 'ANDROID')),
    processed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NFC Scanning table
CREATE TABLE IF NOT EXISTS nfc_scanning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tag_id VARCHAR(255) NOT NULL,
    tag_type VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    scanned_at TIMESTAMP NOT NULL,
    location JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AR Capture table
CREATE TABLE IF NOT EXISTS ar_capture (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('RECEIPT_CAPTURE', 'INVOICE_CAPTURE', 'DOCUMENT_CAPTURE', 'PRODUCT_SCAN')),
    image_url TEXT NOT NULL,
    ar_data JSONB NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    processing_time INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watch Companion table
CREATE TABLE IF NOT EXISTS watch_companion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('APPLE_WATCH', 'WEAR_OS', 'TIZEN')),
    complications TEXT[] NOT NULL,
    quick_actions TEXT[] NOT NULL,
    notifications TEXT[] NOT NULL,
    last_sync_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('CONNECTED', 'DISCONNECTED', 'SYNCING')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mobile Widgets table
CREATE TABLE IF NOT EXISTS mobile_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('QUICK_ACTIONS', 'RECENT_TRANSACTIONS', 'TIME_TRACKING', 'NOTIFICATIONS', 'ANALYTICS')),
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('IOS', 'ANDROID')),
    configuration JSONB NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    position INTEGER NOT NULL,
    size VARCHAR(20) NOT NULL CHECK (size IN ('SMALL', 'MEDIUM', 'LARGE')),
    last_updated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deep Linking table
CREATE TABLE IF NOT EXISTS deep_linking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    scheme VARCHAR(50) NOT NULL,
    path TEXT NOT NULL,
    parameters JSONB NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('IOS', 'ANDROID', 'WEB')),
    target VARCHAR(100) NOT NULL,
    fallback_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Share Extensions table
CREATE TABLE IF NOT EXISTS share_extensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('RECEIPT', 'INVOICE', 'DOCUMENT', 'LINK')),
    data JSONB NOT NULL,
    source_app VARCHAR(100) NOT NULL,
    target_app VARCHAR(100) NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mobile Analytics table
CREATE TABLE IF NOT EXISTS mobile_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event VARCHAR(100) NOT NULL,
    properties JSONB NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('IOS', 'ANDROID', 'WEB')),
    version VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    device_info JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mobile Performance table
CREATE TABLE IF NOT EXISTS mobile_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    metric VARCHAR(100) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('IOS', 'ANDROID', 'WEB')),
    version VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    device_info JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mobile Crashes table
CREATE TABLE IF NOT EXISTS mobile_crashes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    error TEXT NOT NULL,
    stack_trace TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('IOS', 'ANDROID', 'WEB')),
    version VARCHAR(50) NOT NULL,
    device_info JSONB NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mobile Feedback table
CREATE TABLE IF NOT EXISTS mobile_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('BUG_REPORT', 'FEATURE_REQUEST', 'GENERAL_FEEDBACK', 'RATING')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('IOS', 'ANDROID', 'WEB')),
    version VARCHAR(50) NOT NULL,
    device_info JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    assigned_to VARCHAR(255),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mobile_apps_platform ON mobile_apps(platform);
CREATE INDEX IF NOT EXISTS idx_mobile_apps_status ON mobile_apps(status);

CREATE INDEX IF NOT EXISTS idx_mobile_features_type ON mobile_features(type);
CREATE INDEX IF NOT EXISTS idx_mobile_features_platform ON mobile_features(platform);
CREATE INDEX IF NOT EXISTS idx_mobile_features_enabled ON mobile_features(enabled);

CREATE INDEX IF NOT EXISTS idx_offline_sync_user ON offline_sync(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_sync_entity ON offline_sync(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_offline_sync_synced ON offline_sync(synced);

CREATE INDEX IF NOT EXISTS idx_push_notifications_user ON push_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_status ON push_notifications(status);
CREATE INDEX IF NOT EXISTS idx_push_notifications_platform ON push_notifications(platform);

CREATE INDEX IF NOT EXISTS idx_biometric_auth_user ON biometric_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_biometric_auth_type ON biometric_auth(type);
CREATE INDEX IF NOT EXISTS idx_biometric_auth_platform ON biometric_auth(platform);

CREATE INDEX IF NOT EXISTS idx_camera_scanning_user ON camera_scanning(user_id);
CREATE INDEX IF NOT EXISTS idx_camera_scanning_type ON camera_scanning(type);
CREATE INDEX IF NOT EXISTS idx_camera_scanning_status ON camera_scanning(status);

CREATE INDEX IF NOT EXISTS idx_gps_tracking_user ON gps_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_purpose ON gps_tracking(purpose);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_timestamp ON gps_tracking(timestamp);

CREATE INDEX IF NOT EXISTS idx_voice_commands_user ON voice_commands(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_commands_intent ON voice_commands(intent);
CREATE INDEX IF NOT EXISTS idx_voice_commands_platform ON voice_commands(platform);

CREATE INDEX IF NOT EXISTS idx_nfc_scanning_user ON nfc_scanning(user_id);
CREATE INDEX IF NOT EXISTS idx_nfc_scanning_tag_type ON nfc_scanning(tag_type);

CREATE INDEX IF NOT EXISTS idx_ar_capture_user ON ar_capture(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_capture_type ON ar_capture(type);
CREATE INDEX IF NOT EXISTS idx_ar_capture_status ON ar_capture(status);

CREATE INDEX IF NOT EXISTS idx_watch_companion_user ON watch_companion(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_companion_platform ON watch_companion(platform);
CREATE INDEX IF NOT EXISTS idx_watch_companion_status ON watch_companion(status);

CREATE INDEX IF NOT EXISTS idx_mobile_widgets_user ON mobile_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_widgets_type ON mobile_widgets(type);
CREATE INDEX IF NOT EXISTS idx_mobile_widgets_platform ON mobile_widgets(platform);

CREATE INDEX IF NOT EXISTS idx_deep_linking_platform ON deep_linking(platform);
CREATE INDEX IF NOT EXISTS idx_deep_linking_target ON deep_linking(target);

CREATE INDEX IF NOT EXISTS idx_share_extensions_user ON share_extensions(user_id);
CREATE INDEX IF NOT EXISTS idx_share_extensions_type ON share_extensions(type);
CREATE INDEX IF NOT EXISTS idx_share_extensions_processed ON share_extensions(processed);

CREATE INDEX IF NOT EXISTS idx_mobile_analytics_user ON mobile_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_analytics_event ON mobile_analytics(event);
CREATE INDEX IF NOT EXISTS idx_mobile_analytics_platform ON mobile_analytics(platform);

CREATE INDEX IF NOT EXISTS idx_mobile_performance_user ON mobile_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_performance_metric ON mobile_performance(metric);
CREATE INDEX IF NOT EXISTS idx_mobile_performance_platform ON mobile_performance(platform);

CREATE INDEX IF NOT EXISTS idx_mobile_crashes_user ON mobile_crashes(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_crashes_platform ON mobile_crashes(platform);
CREATE INDEX IF NOT EXISTS idx_mobile_crashes_resolved ON mobile_crashes(resolved);

CREATE INDEX IF NOT EXISTS idx_mobile_feedback_user ON mobile_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_feedback_type ON mobile_feedback(type);
CREATE INDEX IF NOT EXISTS idx_mobile_feedback_status ON mobile_feedback(status);
CREATE INDEX IF NOT EXISTS idx_mobile_feedback_priority ON mobile_feedback(priority);

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_mobile_excellence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mobile_app_updated_at
    BEFORE UPDATE ON mobile_apps
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_excellence_updated_at();

CREATE TRIGGER trigger_update_mobile_feature_updated_at
    BEFORE UPDATE ON mobile_features
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_excellence_updated_at();

CREATE TRIGGER trigger_update_offline_sync_updated_at
    BEFORE UPDATE ON offline_sync
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_excellence_updated_at();

CREATE TRIGGER trigger_update_push_notification_updated_at
    BEFORE UPDATE ON push_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_excellence_updated_at();

CREATE TRIGGER trigger_update_biometric_auth_updated_at
    BEFORE UPDATE ON biometric_auth
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_excellence_updated_at();

CREATE TRIGGER trigger_update_camera_scanning_updated_at
    BEFORE UPDATE ON camera_scanning
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_excellence_updated_at();

CREATE TRIGGER trigger_update_ar_capture_updated_at
    BEFORE UPDATE ON ar_capture
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_excellence_updated_at();

CREATE TRIGGER trigger_update_watch_companion_updated_at
    BEFORE UPDATE ON watch_companion
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_excellence_updated_at();

CREATE TRIGGER trigger_update_mobile_widget_updated_at
    BEFORE UPDATE ON mobile_widgets
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_excellence_updated_at();

CREATE TRIGGER trigger_update_deep_linking_updated_at
    BEFORE UPDATE ON deep_linking
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_excellence_updated_at();

CREATE TRIGGER trigger_update_share_extension_updated_at
    BEFORE UPDATE ON share_extensions
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_excellence_updated_at();

CREATE TRIGGER trigger_update_mobile_crash_updated_at
    BEFORE UPDATE ON mobile_crashes
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_excellence_updated_at();

CREATE TRIGGER trigger_update_mobile_feedback_updated_at
    BEFORE UPDATE ON mobile_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_excellence_updated_at();

-- Create function to update push notification status
CREATE OR REPLACE FUNCTION update_push_notification_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status based on timestamps
    IF NEW.delivered_at IS NOT NULL AND NEW.read_at IS NULL THEN
        NEW.status := 'DELIVERED';
    ELSIF NEW.read_at IS NOT NULL THEN
        NEW.status := 'READ';
    ELSIF NEW.clicked_at IS NOT NULL THEN
        NEW.status := 'CLICKED';
    ELSIF NEW.sent_at IS NOT NULL THEN
        NEW.status := 'SENT';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_push_notification_status
    BEFORE UPDATE ON push_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_push_notification_status();

-- Create function to update offline sync status
CREATE OR REPLACE FUNCTION update_offline_sync_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update sync status when synced
    IF NEW.synced = TRUE AND NEW.sync_timestamp IS NULL THEN
        NEW.sync_timestamp := CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_offline_sync_status
    BEFORE UPDATE ON offline_sync
    FOR EACH ROW
    EXECUTE FUNCTION update_offline_sync_status();

-- Create function to update watch companion sync
CREATE OR REPLACE FUNCTION update_watch_companion_sync()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last sync timestamp
    IF NEW.status = 'SYNCING' THEN
        NEW.last_sync_at := CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_watch_companion_sync
    BEFORE UPDATE ON watch_companion
    FOR EACH ROW
    EXECUTE FUNCTION update_watch_companion_sync();

-- Create function to update mobile widget last updated
CREATE OR REPLACE FUNCTION update_mobile_widget_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last updated timestamp
    NEW.last_updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mobile_widget_last_updated
    BEFORE UPDATE ON mobile_widgets
    FOR EACH ROW
    EXECUTE FUNCTION update_mobile_widget_last_updated();

-- Create function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_mobile_data()
RETURNS VOID AS $$
BEGIN
    -- Delete old GPS tracking data (older than 1 year)
    DELETE FROM gps_tracking 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year';
    
    -- Delete old mobile analytics (older than 6 months)
    DELETE FROM mobile_analytics 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '6 months';
    
    -- Delete old mobile performance data (older than 3 months)
    DELETE FROM mobile_performance 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '3 months';
    
    -- Delete old resolved crashes (older than 1 year)
    DELETE FROM mobile_crashes 
    WHERE resolved = TRUE 
    AND resolved_at < CURRENT_TIMESTAMP - INTERVAL '1 year';
    
    -- Delete old closed feedback (older than 2 years)
    DELETE FROM mobile_feedback 
    WHERE status = 'CLOSED' 
    AND resolved_at < CURRENT_TIMESTAMP - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Create function to get mobile excellence statistics
CREATE OR REPLACE FUNCTION get_mobile_excellence_stats()
RETURNS TABLE (
    total_apps BIGINT,
    total_features BIGINT,
    total_offline_sync BIGINT,
    total_push_notifications BIGINT,
    total_biometric_auth BIGINT,
    total_camera_scanning BIGINT,
    total_gps_tracking BIGINT,
    total_voice_commands BIGINT,
    total_nfc_scanning BIGINT,
    total_ar_capture BIGINT,
    total_watch_companion BIGINT,
    total_mobile_widgets BIGINT,
    total_deep_linking BIGINT,
    total_share_extensions BIGINT,
    total_mobile_analytics BIGINT,
    total_mobile_performance BIGINT,
    total_mobile_crashes BIGINT,
    total_mobile_feedback BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM mobile_apps)::BIGINT,
        (SELECT COUNT(*) FROM mobile_features)::BIGINT,
        (SELECT COUNT(*) FROM offline_sync)::BIGINT,
        (SELECT COUNT(*) FROM push_notifications)::BIGINT,
        (SELECT COUNT(*) FROM biometric_auth)::BIGINT,
        (SELECT COUNT(*) FROM camera_scanning)::BIGINT,
        (SELECT COUNT(*) FROM gps_tracking)::BIGINT,
        (SELECT COUNT(*) FROM voice_commands)::BIGINT,
        (SELECT COUNT(*) FROM nfc_scanning)::BIGINT,
        (SELECT COUNT(*) FROM ar_capture)::BIGINT,
        (SELECT COUNT(*) FROM watch_companion)::BIGINT,
        (SELECT COUNT(*) FROM mobile_widgets)::BIGINT,
        (SELECT COUNT(*) FROM deep_linking)::BIGINT,
        (SELECT COUNT(*) FROM share_extensions)::BIGINT,
        (SELECT COUNT(*) FROM mobile_analytics)::BIGINT,
        (SELECT COUNT(*) FROM mobile_performance)::BIGINT,
        (SELECT COUNT(*) FROM mobile_crashes)::BIGINT,
        (SELECT COUNT(*) FROM mobile_feedback)::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- Create function to get mobile performance metrics
CREATE OR REPLACE FUNCTION get_mobile_performance_metrics()
RETURNS TABLE (
    platform VARCHAR(20),
    avg_launch_time DECIMAL(10,2),
    avg_memory_usage DECIMAL(10,2),
    avg_battery_usage DECIMAL(10,2),
    crash_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mp.platform,
        AVG(CASE WHEN mp.metric = 'launch_time' THEN mp.value END)::DECIMAL(10,2),
        AVG(CASE WHEN mp.metric = 'memory_usage' THEN mp.value END)::DECIMAL(10,2),
        AVG(CASE WHEN mp.metric = 'battery_usage' THEN mp.value END)::DECIMAL(10,2),
        (COUNT(CASE WHEN mc.resolved = FALSE THEN 1 END)::DECIMAL / COUNT(*) * 100)::DECIMAL(5,2)
    FROM mobile_performance mp
    LEFT JOIN mobile_crashes mc ON mp.platform = mc.platform
    GROUP BY mp.platform;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user engagement metrics
CREATE OR REPLACE FUNCTION get_user_engagement_metrics()
RETURNS TABLE (
    date DATE,
    active_users BIGINT,
    total_sessions BIGINT,
    avg_session_duration DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(ma.timestamp) as date,
        COUNT(DISTINCT ma.user_id) as active_users,
        COUNT(*) as total_sessions,
        AVG(EXTRACT(EPOCH FROM (MAX(ma.timestamp) - MIN(ma.timestamp)))) as avg_session_duration
    FROM mobile_analytics ma
    WHERE ma.event = 'session_start'
    GROUP BY DATE(ma.timestamp)
    ORDER BY date DESC
    LIMIT 30;
END;
$$ LANGUAGE plpgsql;







