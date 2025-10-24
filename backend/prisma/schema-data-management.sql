-- Data Management Schema
-- This schema supports comprehensive data management including
-- data warehouses, sources, transformations, quality, lineage, catalog,
-- governance, import/export, migration, backup/restore, and analytics

-- Data Warehouses table
CREATE TABLE IF NOT EXISTS data_warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('SNOWFLAKE', 'BIGQUERY', 'REDSHIFT', 'POSTGRESQL', 'MYSQL', 'MONGODB', 'ELASTICSEARCH', 'CASSANDRA')),
    connection JSONB NOT NULL, -- Connection configuration
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR', 'MAINTENANCE')),
    last_sync TIMESTAMP,
    sync_status VARCHAR(20) DEFAULT 'PENDING' CHECK (sync_status IN ('SUCCESS', 'FAILED', 'IN_PROGRESS', 'PENDING')),
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Sources table
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('DATABASE', 'API', 'FILE', 'STREAM', 'WEBHOOK', 'FTP', 'S3', 'GCS', 'AZURE_BLOB')),
    connection JSONB NOT NULL, -- Connection configuration
    schema JSONB NOT NULL, -- Data schema
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR')),
    last_sync TIMESTAMP,
    sync_status VARCHAR(20) DEFAULT 'PENDING' CHECK (sync_status IN ('SUCCESS', 'FAILED', 'IN_PROGRESS', 'PENDING')),
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Transformations table
CREATE TABLE IF NOT EXISTS data_transformations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    sql TEXT NOT NULL,
    schedule JSONB NOT NULL, -- Schedule configuration
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR')),
    last_run TIMESTAMP,
    run_status VARCHAR(20) DEFAULT 'PENDING' CHECK (run_status IN ('SUCCESS', 'FAILED', 'IN_PROGRESS', 'PENDING')),
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Quality table
CREATE TABLE IF NOT EXISTS data_quality (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    rules JSONB NOT NULL, -- Quality rules
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR')),
    last_run TIMESTAMP,
    run_status VARCHAR(20) DEFAULT 'PENDING' CHECK (run_status IN ('SUCCESS', 'FAILED', 'IN_PROGRESS', 'PENDING')),
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Lineage table
CREATE TABLE IF NOT EXISTS data_lineage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    transformation_id UUID REFERENCES data_transformations(id) ON DELETE SET NULL,
    lineage JSONB NOT NULL, -- Lineage steps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Catalog table
CREATE TABLE IF NOT EXISTS data_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('TABLE', 'VIEW', 'FUNCTION', 'PROCEDURE', 'COLUMN', 'SCHEMA', 'DATABASE')),
    schema VARCHAR(255) NOT NULL,
    table VARCHAR(255) NOT NULL,
    column VARCHAR(255),
    data_type VARCHAR(50),
    description TEXT NOT NULL,
    tags TEXT[] NOT NULL,
    owner VARCHAR(255) NOT NULL,
    business_owner VARCHAR(255) NOT NULL,
    classification VARCHAR(20) NOT NULL CHECK (classification IN ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED')),
    sensitivity VARCHAR(20) NOT NULL CHECK (sensitivity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    retention JSONB NOT NULL, -- Retention policy
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Governance table
CREATE TABLE IF NOT EXISTS data_governance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    policies JSONB NOT NULL, -- Governance policies
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DRAFT')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Imports table
CREATE TABLE IF NOT EXISTS data_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source JSONB NOT NULL, -- Source configuration
    target JSONB NOT NULL, -- Target configuration
    mapping JSONB NOT NULL, -- Field mapping
    schedule JSONB NOT NULL, -- Schedule configuration
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR')),
    last_run TIMESTAMP,
    run_status VARCHAR(20) DEFAULT 'PENDING' CHECK (run_status IN ('SUCCESS', 'FAILED', 'IN_PROGRESS', 'PENDING')),
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Exports table
CREATE TABLE IF NOT EXISTS data_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source JSONB NOT NULL, -- Source configuration
    target JSONB NOT NULL, -- Target configuration
    format VARCHAR(20) NOT NULL CHECK (format IN ('CSV', 'JSON', 'XML', 'PARQUET', 'AVRO', 'ORC')),
    query TEXT NOT NULL,
    schedule JSONB NOT NULL, -- Schedule configuration
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR')),
    last_run TIMESTAMP,
    run_status VARCHAR(20) DEFAULT 'PENDING' CHECK (run_status IN ('SUCCESS', 'FAILED', 'IN_PROGRESS', 'PENDING')),
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Migrations table
CREATE TABLE IF NOT EXISTS data_migrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source JSONB NOT NULL, -- Source configuration
    target JSONB NOT NULL, -- Target configuration
    mapping JSONB NOT NULL, -- Field mapping
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED')),
    progress DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_records BIGINT NOT NULL DEFAULT 0,
    processed_records BIGINT NOT NULL DEFAULT 0,
    failed_records BIGINT NOT NULL DEFAULT 0,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Backups table
CREATE TABLE IF NOT EXISTS data_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source JSONB NOT NULL, -- Source configuration
    target JSONB NOT NULL, -- Target configuration
    schedule JSONB NOT NULL, -- Schedule configuration
    retention JSONB NOT NULL, -- Retention policy
    compression BOOLEAN NOT NULL DEFAULT FALSE,
    encryption BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR')),
    last_run TIMESTAMP,
    run_status VARCHAR(20) DEFAULT 'PENDING' CHECK (run_status IN ('SUCCESS', 'FAILED', 'IN_PROGRESS', 'PENDING')),
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Restores table
CREATE TABLE IF NOT EXISTS data_restores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source JSONB NOT NULL, -- Source configuration
    target JSONB NOT NULL, -- Target configuration
    point_in_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED')),
    progress DECIMAL(5,2) NOT NULL DEFAULT 0,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Analytics table
CREATE TABLE IF NOT EXISTS data_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    query TEXT NOT NULL,
    parameters JSONB NOT NULL,
    schedule JSONB NOT NULL, -- Schedule configuration
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR')),
    last_run TIMESTAMP,
    run_status VARCHAR(20) DEFAULT 'PENDING' CHECK (run_status IN ('SUCCESS', 'FAILED', 'IN_PROGRESS', 'PENDING')),
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_data_warehouses_type ON data_warehouses(type);
CREATE INDEX IF NOT EXISTS idx_data_warehouses_status ON data_warehouses(status);

CREATE INDEX IF NOT EXISTS idx_data_sources_type ON data_sources(type);
CREATE INDEX IF NOT EXISTS idx_data_sources_status ON data_sources(status);

CREATE INDEX IF NOT EXISTS idx_data_transformations_source ON data_transformations(source_id);
CREATE INDEX IF NOT EXISTS idx_data_transformations_target ON data_transformations(target_id);
CREATE INDEX IF NOT EXISTS idx_data_transformations_status ON data_transformations(status);

CREATE INDEX IF NOT EXISTS idx_data_quality_source ON data_quality(source_id);
CREATE INDEX IF NOT EXISTS idx_data_quality_status ON data_quality(status);

CREATE INDEX IF NOT EXISTS idx_data_lineage_source ON data_lineage(source_id);
CREATE INDEX IF NOT EXISTS idx_data_lineage_target ON data_lineage(target_id);

CREATE INDEX IF NOT EXISTS idx_data_catalog_type ON data_catalog(type);
CREATE INDEX IF NOT EXISTS idx_data_catalog_schema ON data_catalog(schema);
CREATE INDEX IF NOT EXISTS idx_data_catalog_table ON data_catalog(table);
CREATE INDEX IF NOT EXISTS idx_data_catalog_classification ON data_catalog(classification);

CREATE INDEX IF NOT EXISTS idx_data_governance_status ON data_governance(status);

CREATE INDEX IF NOT EXISTS idx_data_imports_status ON data_imports(status);
CREATE INDEX IF NOT EXISTS idx_data_imports_last_run ON data_imports(last_run);

CREATE INDEX IF NOT EXISTS idx_data_exports_status ON data_exports(status);
CREATE INDEX IF NOT EXISTS idx_data_exports_format ON data_exports(format);
CREATE INDEX IF NOT EXISTS idx_data_exports_last_run ON data_exports(last_run);

CREATE INDEX IF NOT EXISTS idx_data_migrations_status ON data_migrations(status);
CREATE INDEX IF NOT EXISTS idx_data_migrations_start_time ON data_migrations(start_time);

CREATE INDEX IF NOT EXISTS idx_data_backups_status ON data_backups(status);
CREATE INDEX IF NOT EXISTS idx_data_backups_last_run ON data_backups(last_run);

CREATE INDEX IF NOT EXISTS idx_data_restores_status ON data_restores(status);
CREATE INDEX IF NOT EXISTS idx_data_restores_point_in_time ON data_restores(point_in_time);

CREATE INDEX IF NOT EXISTS idx_data_analytics_status ON data_analytics(status);
CREATE INDEX IF NOT EXISTS idx_data_analytics_last_run ON data_analytics(last_run);

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_data_management_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_data_warehouse_updated_at
    BEFORE UPDATE ON data_warehouses
    FOR EACH ROW
    EXECUTE FUNCTION update_data_management_updated_at();

CREATE TRIGGER trigger_update_data_source_updated_at
    BEFORE UPDATE ON data_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_data_management_updated_at();

CREATE TRIGGER trigger_update_data_transformation_updated_at
    BEFORE UPDATE ON data_transformations
    FOR EACH ROW
    EXECUTE FUNCTION update_data_management_updated_at();

CREATE TRIGGER trigger_update_data_quality_updated_at
    BEFORE UPDATE ON data_quality
    FOR EACH ROW
    EXECUTE FUNCTION update_data_management_updated_at();

CREATE TRIGGER trigger_update_data_lineage_updated_at
    BEFORE UPDATE ON data_lineage
    FOR EACH ROW
    EXECUTE FUNCTION update_data_management_updated_at();

CREATE TRIGGER trigger_update_data_catalog_updated_at
    BEFORE UPDATE ON data_catalog
    FOR EACH ROW
    EXECUTE FUNCTION update_data_management_updated_at();

CREATE TRIGGER trigger_update_data_governance_updated_at
    BEFORE UPDATE ON data_governance
    FOR EACH ROW
    EXECUTE FUNCTION update_data_management_updated_at();

CREATE TRIGGER trigger_update_data_import_updated_at
    BEFORE UPDATE ON data_imports
    FOR EACH ROW
    EXECUTE FUNCTION update_data_management_updated_at();

CREATE TRIGGER trigger_update_data_export_updated_at
    BEFORE UPDATE ON data_exports
    FOR EACH ROW
    EXECUTE FUNCTION update_data_management_updated_at();

CREATE TRIGGER trigger_update_data_migration_updated_at
    BEFORE UPDATE ON data_migrations
    FOR EACH ROW
    EXECUTE FUNCTION update_data_management_updated_at();

CREATE TRIGGER trigger_update_data_backup_updated_at
    BEFORE UPDATE ON data_backups
    FOR EACH ROW
    EXECUTE FUNCTION update_data_management_updated_at();

CREATE TRIGGER trigger_update_data_restore_updated_at
    BEFORE UPDATE ON data_restores
    FOR EACH ROW
    EXECUTE FUNCTION update_data_management_updated_at();

CREATE TRIGGER trigger_update_data_analytics_updated_at
    BEFORE UPDATE ON data_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_data_management_updated_at();

-- Create function to update migration progress
CREATE OR REPLACE FUNCTION update_migration_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate progress percentage
    IF NEW.total_records > 0 THEN
        NEW.progress := (NEW.processed_records::DECIMAL / NEW.total_records) * 100;
    END IF;
    
    -- Update status based on progress
    IF NEW.processed_records >= NEW.total_records AND NEW.total_records > 0 THEN
        NEW.status := 'COMPLETED';
        NEW.end_time := CURRENT_TIMESTAMP;
    ELSIF NEW.failed_records > 0 AND NEW.processed_records + NEW.failed_records >= NEW.total_records THEN
        NEW.status := 'FAILED';
        NEW.end_time := CURRENT_TIMESTAMP;
    ELSIF NEW.processed_records > 0 OR NEW.failed_records > 0 THEN
        NEW.status := 'IN_PROGRESS';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_migration_progress
    BEFORE UPDATE ON data_migrations
    FOR EACH ROW
    EXECUTE FUNCTION update_migration_progress();

-- Create function to update restore progress
CREATE OR REPLACE FUNCTION update_restore_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status based on progress
    IF NEW.progress >= 100 THEN
        NEW.status := 'COMPLETED';
        NEW.end_time := CURRENT_TIMESTAMP;
    ELSIF NEW.progress > 0 THEN
        NEW.status := 'IN_PROGRESS';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_restore_progress
    BEFORE UPDATE ON data_restores
    FOR EACH ROW
    EXECUTE FUNCTION update_restore_progress();

-- Create function to generate data lineage
CREATE OR REPLACE FUNCTION generate_data_lineage()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate lineage when transformation is created
    IF TG_OP = 'INSERT' THEN
        INSERT INTO data_lineage (source_id, target_id, transformation_id, lineage, created_at, updated_at)
        VALUES (
            NEW.source_id,
            NEW.target_id,
            NEW.id,
            jsonb_build_array(
                jsonb_build_object(
                    'step', 'transformation',
                    'input', 'source_data',
                    'output', 'transformed_data',
                    'operation', 'sql_transform',
                    'timestamp', CURRENT_TIMESTAMP
                )
            ),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_data_lineage
    AFTER INSERT ON data_transformations
    FOR EACH ROW
    EXECUTE FUNCTION generate_data_lineage();

-- Create function to validate data quality
CREATE OR REPLACE FUNCTION validate_data_quality()
RETURNS TRIGGER AS $$
DECLARE
    quality_rules JSONB;
    rule JSONB;
    violations INTEGER := 0;
BEGIN
    -- Get quality rules for the source
    SELECT rules INTO quality_rules
    FROM data_quality
    WHERE source_id = NEW.source_id
    AND status = 'ACTIVE';
    
    -- Check each rule
    FOR rule IN SELECT jsonb_array_elements(quality_rules)
    LOOP
        -- This is a simplified example - in practice, you'd execute the actual rule
        IF (rule->>'type')::text = 'COMPLETENESS' THEN
            -- Check for null values
            violations := violations + 1;
        ELSIF (rule->>'type')::text = 'ACCURACY' THEN
            -- Check data accuracy
            violations := violations + 1;
        END IF;
    END LOOP;
    
    -- Update quality status based on violations
    IF violations > 0 THEN
        UPDATE data_quality
        SET run_status = 'FAILED',
            error = 'Data quality violations detected: ' || violations
        WHERE source_id = NEW.source_id;
    ELSE
        UPDATE data_quality
        SET run_status = 'SUCCESS',
            last_run = CURRENT_TIMESTAMP
        WHERE source_id = NEW.source_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
BEGIN
    -- Delete old completed migrations (older than 1 year)
    DELETE FROM data_migrations 
    WHERE status = 'COMPLETED' 
    AND end_time < CURRENT_TIMESTAMP - INTERVAL '1 year';
    
    -- Delete old completed restores (older than 6 months)
    DELETE FROM data_restores 
    WHERE status = 'COMPLETED' 
    AND end_time < CURRENT_TIMESTAMP - INTERVAL '6 months';
    
    -- Delete old failed imports/exports (older than 30 days)
    DELETE FROM data_imports 
    WHERE status = 'ERROR' 
    AND last_run < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    DELETE FROM data_exports 
    WHERE status = 'ERROR' 
    AND last_run < CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to get data volume statistics
CREATE OR REPLACE FUNCTION get_data_volume_stats()
RETURNS TABLE (
    total_warehouses BIGINT,
    total_sources BIGINT,
    total_transformations BIGINT,
    total_imports BIGINT,
    total_exports BIGINT,
    total_migrations BIGINT,
    total_backups BIGINT,
    total_restores BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM data_warehouses)::BIGINT,
        (SELECT COUNT(*) FROM data_sources)::BIGINT,
        (SELECT COUNT(*) FROM data_transformations)::BIGINT,
        (SELECT COUNT(*) FROM data_imports)::BIGINT,
        (SELECT COUNT(*) FROM data_exports)::BIGINT,
        (SELECT COUNT(*) FROM data_migrations)::BIGINT,
        (SELECT COUNT(*) FROM data_backups)::BIGINT,
        (SELECT COUNT(*) FROM data_restores)::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- Create function to get data quality metrics
CREATE OR REPLACE FUNCTION get_data_quality_metrics()
RETURNS TABLE (
    total_rules BIGINT,
    active_rules BIGINT,
    failed_rules BIGINT,
    success_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM data_quality)::BIGINT,
        (SELECT COUNT(*) FROM data_quality WHERE status = 'ACTIVE')::BIGINT,
        (SELECT COUNT(*) FROM data_quality WHERE run_status = 'FAILED')::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM data_quality) > 0 THEN
                ((SELECT COUNT(*) FROM data_quality WHERE run_status = 'SUCCESS')::DECIMAL / 
                 (SELECT COUNT(*) FROM data_quality)::DECIMAL) * 100
            ELSE 0
        END;
END;
$$ LANGUAGE plpgsql;



