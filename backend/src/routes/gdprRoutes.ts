import { Router } from 'express';
import { 
  createDataSubject,
  getDataSubject,
  requestDataExport,
  getDataExport,
  downloadDataExport,
  requestDataDeletion,
  recordConsent,
  withdrawConsent,
  getConsentStatus,
  createDataRetentionPolicy,
  processDataRetention,
  createDataProcessingActivity,
  getDataProcessingActivities
} from '../controllers/gdprController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Data subjects
router.post('/data-subjects', authenticateToken, createDataSubject);
router.get('/data-subjects/:email', authenticateToken, getDataSubject);

// Data exports
router.post('/data-subjects/:dataSubjectId/exports', authenticateToken, requestDataExport);
router.get('/exports/:exportId', authenticateToken, getDataExport);
router.get('/exports/:exportId/download', authenticateToken, downloadDataExport);

// Data deletion
router.post('/data-subjects/:dataSubjectId/deletion', authenticateToken, requestDataDeletion);

// Consent management
router.post('/data-subjects/:dataSubjectId/consent', authenticateToken, recordConsent);
router.delete('/data-subjects/:dataSubjectId/consent', authenticateToken, withdrawConsent);
router.get('/data-subjects/:dataSubjectId/consent', authenticateToken, getConsentStatus);

// Data retention
router.post('/retention-policies', authenticateToken, createDataRetentionPolicy);
router.post('/retention/process', authenticateToken, processDataRetention);

// Data processing activities
router.post('/processing-activities', authenticateToken, createDataProcessingActivity);
router.get('/processing-activities', authenticateToken, getDataProcessingActivities);

export default router;







