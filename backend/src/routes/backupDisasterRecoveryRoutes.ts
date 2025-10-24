import { Router } from 'express';
import BackupDisasterRecoveryController from '../controllers/backupDisasterRecoveryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const backupDisasterRecoveryController = new BackupDisasterRecoveryController();

// Backup Strategies
router.post('/companies/:companyId/backup-strategies', authenticateToken, backupDisasterRecoveryController.createBackupStrategy);
router.get('/companies/:companyId/backup-strategies', authenticateToken, backupDisasterRecoveryController.getBackupStrategies);
router.put('/backup-strategies/:strategyId', authenticateToken, backupDisasterRecoveryController.updateBackupStrategy);
router.delete('/backup-strategies/:strategyId', authenticateToken, backupDisasterRecoveryController.deleteBackupStrategy);

// Backup Jobs
router.post('/backup-strategies/:strategyId/jobs', authenticateToken, backupDisasterRecoveryController.startBackupJob);
router.get('/backup-strategies/:strategyId/jobs', authenticateToken, backupDisasterRecoveryController.getBackupJobs);
router.post('/backup-jobs/:jobId/cancel', authenticateToken, backupDisasterRecoveryController.cancelBackupJob);

// Recovery Points
router.post('/backup-jobs/:backupJobId/recovery-points', authenticateToken, backupDisasterRecoveryController.createRecoveryPoint);
router.get('/backup-jobs/:backupJobId/recovery-points', authenticateToken, backupDisasterRecoveryController.getRecoveryPoints);
router.post('/recovery-points/:recoveryPointId/verify', authenticateToken, backupDisasterRecoveryController.verifyBackupIntegrity);
router.post('/recovery-points/:recoveryPointId/restore', authenticateToken, backupDisasterRecoveryController.restoreFromBackup);

// Disaster Recovery Plans
router.post('/companies/:companyId/disaster-recovery-plans', authenticateToken, backupDisasterRecoveryController.createDisasterRecoveryPlan);
router.get('/companies/:companyId/disaster-recovery-plans', authenticateToken, backupDisasterRecoveryController.getDisasterRecoveryPlans);
router.post('/disaster-recovery-plans/:planId/test', authenticateToken, backupDisasterRecoveryController.testDisasterRecoveryPlan);

// High Availability
router.post('/companies/:companyId/high-availability', authenticateToken, backupDisasterRecoveryController.createHighAvailabilityConfig);
router.get('/companies/:companyId/high-availability', authenticateToken, backupDisasterRecoveryController.getHighAvailabilityConfigs);
router.post('/high-availability/:configId/failover', authenticateToken, backupDisasterRecoveryController.executeFailover);

// Metrics
router.get('/companies/:companyId/backup-metrics', authenticateToken, backupDisasterRecoveryController.getBackupMetrics);
router.get('/companies/:companyId/disaster-recovery-metrics', authenticateToken, backupDisasterRecoveryController.getDisasterRecoveryMetrics);

export default router;




