import { Router } from 'express';
import {
  processFile,
  validateMappings,
  startImport,
  getImportJob,
  getImportJobs,
  saveTemplate,
  getTemplates,
  deleteTemplate,
  getImportStats,
  exportResults,
  cleanupOldJobs,
  downloadTemplate,
  upload
} from '../controllers/importController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// File processing routes
router.post('/process', upload.single('file'), processFile);
router.post('/validate', validateMappings);

// Import job management
router.post('/start', startImport);
router.get('/jobs', getImportJobs);
router.get('/jobs/:jobId', getImportJob);
router.get('/jobs/:jobId/export', exportResults);

// Template management
router.post('/templates', saveTemplate);
router.get('/templates', getTemplates);
router.delete('/templates/:templateId', deleteTemplate);

// Statistics and maintenance
router.get('/stats', getImportStats);
router.post('/cleanup', cleanupOldJobs);

// Template downloads
router.get('/templates/download/:type', downloadTemplate);

export default router;

