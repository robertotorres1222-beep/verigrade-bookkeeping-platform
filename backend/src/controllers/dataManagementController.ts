import { Request, Response } from 'express';
import { dataManagementService } from '../services/dataManagementService';
import logger from '../utils/logger';

export class DataManagementController {
  // Data Warehouse Management
  async createDataWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const warehouse = await dataManagementService.createDataWarehouse(req.body);
      res.status(201).json({
        success: true,
        data: warehouse,
        message: 'Data warehouse created successfully',
      });
    } catch (error) {
      logger.error('Error creating data warehouse', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create data warehouse',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDataWarehouses(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await dataManagementService.getDataWarehouses(filters);
      res.json({
        success: true,
        data: result,
        message: 'Data warehouses retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching data warehouses', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data warehouses',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Data Source Management
  async createDataSource(req: Request, res: Response): Promise<void> {
    try {
      const source = await dataManagementService.createDataSource(req.body);
      res.status(201).json({
        success: true,
        data: source,
        message: 'Data source created successfully',
      });
    } catch (error) {
      logger.error('Error creating data source', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create data source',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDataSources(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await dataManagementService.getDataSources(filters);
      res.json({
        success: true,
        data: result,
        message: 'Data sources retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching data sources', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data sources',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Data Transformation Management
  async createDataTransformation(req: Request, res: Response): Promise<void> {
    try {
      const transformation = await dataManagementService.createDataTransformation(req.body);
      res.status(201).json({
        success: true,
        data: transformation,
        message: 'Data transformation created successfully',
      });
    } catch (error) {
      logger.error('Error creating data transformation', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create data transformation',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDataTransformations(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        sourceId: req.query.sourceId as string || undefined,
        targetId: req.query.targetId as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await dataManagementService.getDataTransformations(filters);
      res.json({
        success: true,
        data: result,
        message: 'Data transformations retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching data transformations', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data transformations',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Data Quality Management
  async createDataQuality(req: Request, res: Response): Promise<void> {
    try {
      const quality = await dataManagementService.createDataQuality(req.body);
      res.status(201).json({
        success: true,
        data: quality,
        message: 'Data quality created successfully',
      });
    } catch (error) {
      logger.error('Error creating data quality', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create data quality',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDataQuality(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        sourceId: req.query.sourceId as string || undefined,
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await dataManagementService.getDataQuality(filters);
      res.json({
        success: true,
        data: result,
        message: 'Data quality retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching data quality', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data quality',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Data Lineage Management
  async createDataLineage(req: Request, res: Response): Promise<void> {
    try {
      const lineage = await dataManagementService.createDataLineage(req.body);
      res.status(201).json({
        success: true,
        data: lineage,
        message: 'Data lineage created successfully',
      });
    } catch (error) {
      logger.error('Error creating data lineage', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create data lineage',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDataLineage(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        sourceId: req.query.sourceId as string || undefined,
        targetId: req.query.targetId as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await dataManagementService.getDataLineage(filters);
      res.json({
        success: true,
        data: result,
        message: 'Data lineage retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching data lineage', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data lineage',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Data Catalog Management
  async createDataCatalog(req: Request, res: Response): Promise<void> {
    try {
      const catalog = await dataManagementService.createDataCatalog(req.body);
      res.status(201).json({
        success: true,
        data: catalog,
        message: 'Data catalog created successfully',
      });
    } catch (error) {
      logger.error('Error creating data catalog', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create data catalog',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDataCatalog(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as string || undefined,
        schema: req.query.schema as string || undefined,
        table: req.query.table as string || undefined,
        classification: req.query.classification as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await dataManagementService.getDataCatalog(filters);
      res.json({
        success: true,
        data: result,
        message: 'Data catalog retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching data catalog', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data catalog',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Data Governance Management
  async createDataGovernance(req: Request, res: Response): Promise<void> {
    try {
      const governance = await dataManagementService.createDataGovernance(req.body);
      res.status(201).json({
        success: true,
        data: governance,
        message: 'Data governance created successfully',
      });
    } catch (error) {
      logger.error('Error creating data governance', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create data governance',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDataGovernance(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await dataManagementService.getDataGovernance(filters);
      res.json({
        success: true,
        data: result,
        message: 'Data governance retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching data governance', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data governance',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Data Import Management
  async createDataImport(req: Request, res: Response): Promise<void> {
    try {
      const import_ = await dataManagementService.createDataImport(req.body);
      res.status(201).json({
        success: true,
        data: import_,
        message: 'Data import created successfully',
      });
    } catch (error) {
      logger.error('Error creating data import', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create data import',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDataImports(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await dataManagementService.getDataImports(filters);
      res.json({
        success: true,
        data: result,
        message: 'Data imports retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching data imports', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data imports',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Data Export Management
  async createDataExport(req: Request, res: Response): Promise<void> {
    try {
      const export_ = await dataManagementService.createDataExport(req.body);
      res.status(201).json({
        success: true,
        data: export_,
        message: 'Data export created successfully',
      });
    } catch (error) {
      logger.error('Error creating data export', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create data export',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDataExports(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await dataManagementService.getDataExports(filters);
      res.json({
        success: true,
        data: result,
        message: 'Data exports retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching data exports', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data exports',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Data Migration Management
  async createDataMigration(req: Request, res: Response): Promise<void> {
    try {
      const migration = await dataManagementService.createDataMigration(req.body);
      res.status(201).json({
        success: true,
        data: migration,
        message: 'Data migration created successfully',
      });
    } catch (error) {
      logger.error('Error creating data migration', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create data migration',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDataMigrations(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await dataManagementService.getDataMigrations(filters);
      res.json({
        success: true,
        data: result,
        message: 'Data migrations retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching data migrations', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data migrations',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Data Backup Management
  async createDataBackup(req: Request, res: Response): Promise<void> {
    try {
      const backup = await dataManagementService.createDataBackup(req.body);
      res.status(201).json({
        success: true,
        data: backup,
        message: 'Data backup created successfully',
      });
    } catch (error) {
      logger.error('Error creating data backup', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create data backup',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDataBackups(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await dataManagementService.getDataBackups(filters);
      res.json({
        success: true,
        data: result,
        message: 'Data backups retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching data backups', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data backups',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Data Restore Management
  async createDataRestore(req: Request, res: Response): Promise<void> {
    try {
      const restore = await dataManagementService.createDataRestore(req.body);
      res.status(201).json({
        success: true,
        data: restore,
        message: 'Data restore created successfully',
      });
    } catch (error) {
      logger.error('Error creating data restore', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create data restore',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDataRestores(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await dataManagementService.getDataRestores(filters);
      res.json({
        success: true,
        data: result,
        message: 'Data restores retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching data restores', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data restores',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Data Analytics Management
  async createDataAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await dataManagementService.createDataAnalytics(req.body);
      res.status(201).json({
        success: true,
        data: analytics,
        message: 'Data analytics created successfully',
      });
    } catch (error) {
      logger.error('Error creating data analytics', { error, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to create data analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getDataAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await dataManagementService.getDataAnalytics(filters);
      res.json({
        success: true,
        data: result,
        message: 'Data analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching data analytics', { error, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Analytics and Reporting
  async getDataManagementAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await dataManagementService.getDataManagementAnalytics();
      res.json({
        success: true,
        data: analytics,
        message: 'Data management analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching data management analytics', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data management analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const dataManagementController = new DataManagementController();




