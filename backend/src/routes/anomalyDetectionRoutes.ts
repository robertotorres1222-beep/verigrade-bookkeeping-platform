import { Router } from 'express';
import { AnomalyDetectionController } from '../controllers/anomalyDetectionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const anomalyDetectionController = new AnomalyDetectionController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/anomaly-detection/dashboard
 * @desc Get anomaly detection dashboard
 * @access Private
 */
router.get('/dashboard', anomalyDetectionController.getAnomalyDetectionDashboard);

/**
 * @route GET /api/anomaly-detection/financial
 * @desc Detect financial anomalies
 * @access Private
 */
router.get('/financial', anomalyDetectionController.detectFinancialAnomalies);

/**
 * @route GET /api/anomaly-detection/vendor
 * @desc Detect vendor anomalies
 * @access Private
 */
router.get('/vendor', anomalyDetectionController.detectVendorAnomalies);

/**
 * @route GET /api/anomaly-detection/employee
 * @desc Detect employee anomalies
 * @access Private
 */
router.get('/employee', anomalyDetectionController.detectEmployeeAnomalies);

/**
 * @route GET /api/anomaly-detection/stats
 * @desc Get anomaly statistics
 * @access Private
 */
router.get('/stats', anomalyDetectionController.getAnomalyStats);

/**
 * @route GET /api/anomaly-detection/analyses
 * @desc Get recent analyses
 * @access Private
 */
router.get('/analyses', anomalyDetectionController.getRecentAnalyses);

/**
 * @route GET /api/anomaly-detection/alerts
 * @desc Get anomaly alerts
 * @access Private
 */
router.get('/alerts', anomalyDetectionController.getAnomalyAlerts);

/**
 * @route GET /api/anomaly-detection/alert-summary
 * @desc Get alert summary
 * @access Private
 */
router.get('/alert-summary', anomalyDetectionController.getAlertSummary);

/**
 * @route GET /api/anomaly-detection/trends
 * @desc Get trend analysis
 * @access Private
 */
router.get('/trends', anomalyDetectionController.getTrendAnalysis);

/**
 * @route GET /api/anomaly-detection/patterns
 * @desc Get anomaly patterns
 * @access Private
 */
router.get('/patterns', anomalyDetectionController.getAnomalyPatterns);

/**
 * @route POST /api/anomaly-detection/analysis
 * @desc Save anomaly detection analysis
 * @access Private
 */
router.post('/analysis', anomalyDetectionController.saveAnomalyDetectionAnalysis);

export default router;