-- Enhanced Time Tracking Schema
-- This schema supports advanced time tracking with project management,
-- resource allocation, GPS tracking, idle detection, and comprehensive analytics

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_id UUID,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'COMPLETED', 'ON_HOLD')),
    budget DECIMAL(15,2) NOT NULL DEFAULT 0,
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    estimated_hours DECIMAL(8,2) DEFAULT 0,
    actual_hours DECIMAL(8,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time entries table
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration INTEGER NOT NULL DEFAULT 0, -- in minutes
    billable BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'PAUSED', 'COMPLETED', 'APPROVED', 'REJECTED')),
    location JSONB, -- {latitude, longitude, address}
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timesheets table
CREATE TABLE IF NOT EXISTS timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    total_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    billable_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')),
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    skills TEXT[], -- Array of skills
    availability JSONB NOT NULL, -- Weekly availability schedule
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project costing table
CREATE TABLE IF NOT EXISTS project_costing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    budget DECIMAL(15,2) NOT NULL DEFAULT 0,
    actual_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    estimated_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    actual_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    profit_margin DECIMAL(5,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ON_TRACK' CHECK (status IN ('ON_TRACK', 'OVER_BUDGET', 'UNDER_BUDGET', 'COMPLETED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Idle detection table
CREATE TABLE IF NOT EXISTS idle_detection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time_entry_id UUID NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
    idle_start_time TIMESTAMP NOT NULL,
    idle_end_time TIMESTAMP,
    duration INTEGER NOT NULL DEFAULT 0, -- in minutes
    reason VARCHAR(30) NOT NULL CHECK (reason IN ('USER_INACTIVE', 'SYSTEM_LOCKED', 'APPLICATION_MINIMIZED')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GPS tracking table
CREATE TABLE IF NOT EXISTS gps_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time_entry_id UUID NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    address TEXT NOT NULL,
    accuracy DECIMAL(8,2) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time tracking analytics table
CREATE TABLE IF NOT EXISTS time_tracking_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    total_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    billable_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
    total_revenue DECIMAL(15,2) NOT NULL DEFAULT 0,
    productivity_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time tracking settings table
CREATE TABLE IF NOT EXISTS time_tracking_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    idle_timeout INTEGER NOT NULL DEFAULT 5, -- minutes
    auto_pause BOOLEAN DEFAULT TRUE,
    gps_tracking BOOLEAN DEFAULT FALSE,
    break_reminders BOOLEAN DEFAULT TRUE,
    break_interval INTEGER NOT NULL DEFAULT 60, -- minutes
    overtime_threshold DECIMAL(8,2) NOT NULL DEFAULT 8.0, -- hours
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Time tracking reports table
CREATE TABLE IF NOT EXISTS time_tracking_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    filters JSONB NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(500),
    status VARCHAR(20) DEFAULT 'GENERATING' CHECK (status IN ('GENERATING', 'COMPLETED', 'FAILED'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_billable ON time_entries(billable);

CREATE INDEX IF NOT EXISTS idx_timesheets_user ON timesheets(user_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);
CREATE INDEX IF NOT EXISTS idx_timesheets_week ON timesheets(week_start_date, week_end_date);

CREATE INDEX IF NOT EXISTS idx_resources_user ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_role ON resources(role);

CREATE INDEX IF NOT EXISTS idx_project_costing_project ON project_costing(project_id);
CREATE INDEX IF NOT EXISTS idx_project_costing_status ON project_costing(status);

CREATE INDEX IF NOT EXISTS idx_idle_detection_time_entry ON idle_detection(time_entry_id);
CREATE INDEX IF NOT EXISTS idx_idle_detection_status ON idle_detection(status);
CREATE INDEX IF NOT EXISTS idx_idle_detection_start_time ON idle_detection(idle_start_time);

CREATE INDEX IF NOT EXISTS idx_gps_tracking_time_entry ON gps_tracking(time_entry_id);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_timestamp ON gps_tracking(timestamp);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_location ON gps_tracking(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_analytics_user ON time_tracking_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_project ON time_tracking_analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON time_tracking_analytics(date);

CREATE INDEX IF NOT EXISTS idx_settings_user ON time_tracking_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_reports_user ON time_tracking_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON time_tracking_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON time_tracking_reports(status);

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_project_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_project_updated_at();

CREATE TRIGGER trigger_update_task_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_updated_at();

CREATE TRIGGER trigger_update_time_entry_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_project_updated_at();

CREATE TRIGGER trigger_update_timesheet_updated_at
    BEFORE UPDATE ON timesheets
    FOR EACH ROW
    EXECUTE FUNCTION update_project_updated_at();

CREATE TRIGGER trigger_update_resource_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_project_updated_at();

CREATE TRIGGER trigger_update_project_costing_updated_at
    BEFORE UPDATE ON project_costing
    FOR EACH ROW
    EXECUTE FUNCTION update_project_updated_at();

CREATE TRIGGER trigger_update_settings_updated_at
    BEFORE UPDATE ON time_tracking_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_project_updated_at();

-- Create function to calculate time entry duration
CREATE OR REPLACE FUNCTION calculate_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60; -- in minutes
        NEW.total_amount = (NEW.duration / 60) * NEW.hourly_rate;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_duration
    BEFORE INSERT OR UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_time_entry_duration();

-- Create function to update task actual hours
CREATE OR REPLACE FUNCTION update_task_actual_hours()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
        UPDATE tasks 
        SET actual_hours = actual_hours + (NEW.duration / 60)
        WHERE id = NEW.task_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_hours
    AFTER UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_task_actual_hours();

-- Create function to generate weekly timesheet
CREATE OR REPLACE FUNCTION generate_weekly_timesheet()
RETURNS TRIGGER AS $$
DECLARE
    week_start DATE;
    week_end DATE;
    total_hours DECIMAL(8,2);
    billable_hours DECIMAL(8,2);
BEGIN
    -- Calculate week start and end dates
    week_start := DATE_TRUNC('week', NEW.start_time)::DATE;
    week_end := week_start + INTERVAL '6 days';
    
    -- Calculate total hours for the week
    SELECT 
        COALESCE(SUM(duration / 60), 0),
        COALESCE(SUM(CASE WHEN billable THEN duration / 60 ELSE 0 END), 0)
    INTO total_hours, billable_hours
    FROM time_entries
    WHERE user_id = NEW.user_id
    AND start_time >= week_start
    AND start_time < week_end + INTERVAL '1 day'
    AND status = 'COMPLETED';
    
    -- Insert or update timesheet
    INSERT INTO timesheets (user_id, week_start_date, week_end_date, total_hours, billable_hours)
    VALUES (NEW.user_id, week_start, week_end, total_hours, billable_hours)
    ON CONFLICT (user_id, week_start_date) 
    DO UPDATE SET 
        total_hours = EXCLUDED.total_hours,
        billable_hours = EXCLUDED.billable_hours,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_timesheet
    AFTER INSERT OR UPDATE ON time_entries
    FOR EACH ROW
    WHEN (NEW.status = 'COMPLETED')
    EXECUTE FUNCTION generate_weekly_timesheet();

-- Create function to detect idle time
CREATE OR REPLACE FUNCTION detect_idle_time()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if time entry has been running for more than 5 minutes without activity
    IF NEW.status = 'RUNNING' AND OLD.status = 'RUNNING' THEN
        IF EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - NEW.start_time)) > 300 THEN -- 5 minutes
            INSERT INTO idle_detection (time_entry_id, idle_start_time, duration, reason, status)
            VALUES (NEW.id, NEW.start_time, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - NEW.start_time)) / 60, 'USER_INACTIVE', 'ACTIVE');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_detect_idle
    AFTER UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION detect_idle_time();



