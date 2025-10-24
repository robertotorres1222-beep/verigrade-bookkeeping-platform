import { Router } from 'express';
import { dataManagementController } from '../controllers/dataManagementController';

const router = Router();

// Data Warehouse Management Routes
router.post('/warehouses', dataManagementController.createDataWarehouse);
router.get('/warehouses', dataManagementController.getDataWarehouses);

// Data Source Management Routes
router.post('/sources', dataManagementController.createDataSource);
router.get('/sources', dataManagementController.getDataSources);

// Data Transformation Management Routes
router.post('/transformations', dataManagementController.createDataTransformation);
router.get('/transformations', dataManagementController.getDataTransformations);

// Data Quality Management Routes
router.post('/quality', dataManagementController.createDataQuality);
router.get('/quality', dataManagementController.getDataQuality);

// Data Lineage Management Routes
router.post('/lineage', dataManagementController.createDataLineage);
router.get('/lineage', dataManagementController.getDataLineage);

// Data Catalog Management Routes
router.post('/catalog', dataManagementController.createDataCatalog);
router.get('/catalog', dataManagementController.getDataCatalog);

// Data Governance Management Routes
router.post('/governance', dataManagementController.createDataGovernance);
router.get('/governance', dataManagementController.getDataGovernance);

// Data Import Management Routes
router.post('/imports', dataManagementController.createDataImport);
router.get('/imports', dataManagementController.getDataImports);

// Data Export Management Routes
router.post('/exports', dataManagementController.createDataExport);
router.get('/exports', dataManagementController.getDataExports);

// Data Migration Management Routes
router.post('/migrations', dataManagementController.createDataMigration);
router.get('/migrations', dataManagementController.getDataMigrations);

// Data Backup Management Routes
router.post('/backups', dataManagementController.createDataBackup);
router.get('/backups', dataManagementController.getDataBackups);

// Data Restore Management Routes
router.post('/restores', dataManagementController.createDataRestore);
router.get('/restores', dataManagementController.getDataRestores);

// Data Analytics Management Routes
router.post('/analytics', dataManagementController.createDataAnalytics);
router.get('/analytics', dataManagementController.getDataAnalytics);

// Analytics and Reporting Routes
router.get('/analytics/overview', dataManagementController.getDataManagementAnalytics);

export default router;




