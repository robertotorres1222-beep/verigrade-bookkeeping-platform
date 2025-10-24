import { Router } from 'express';
import { FraudController } from '../controllers/fraudController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const fraudController = new FraudController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Fraud Detection routes
router.get('/dashboard', fraudController.getFraudDashboard.bind(fraudController));
router.get('/stats', fraudController.getFraudStats.bind(fraudController));
router.get('/recent', fraudController.getRecentFraudDetections.bind(fraudController));
router.get('/risk-analysis', fraudController.getFraudRiskAnalysis.bind(fraudController));
router.post('/comprehensive', fraudController.runComprehensiveFraudDetection.bind(fraudController));
router.post('/:detectionId/resolve', fraudController.resolveFraudDetection.bind(fraudController));

// Ghost Employee Detection routes
router.get('/ghost-employees', fraudController.detectGhostEmployees.bind(fraudController));
router.get('/ghost-employees/dashboard', fraudController.getGhostEmployeeDashboard.bind(fraudController));
router.get('/ghost-employees/trends', fraudController.getGhostEmployeeTrends.bind(fraudController));
router.post('/ghost-employees/:reportId/resolve', fraudController.resolveGhostEmployeeReport.bind(fraudController));

// Split Transaction Detection routes
router.get('/split-transactions', fraudController.detectSplitTransactions.bind(fraudController));

// Duplicate Invoice Detection routes
router.get('/duplicate-invoices', fraudController.detectDuplicateInvoices.bind(fraudController));

// Round Number Transaction Detection routes
router.get('/round-number-transactions', fraudController.detectRoundNumberTransactions.bind(fraudController));

// Vendor Verification routes
router.get('/suspicious-vendors', fraudController.verifyVendorExistence.bind(fraudController));

// Benford's Law Analysis routes
router.post('/benford/:dataType', fraudController.performBenfordAnalysis.bind(fraudController));
router.get('/benford/dashboard', fraudController.getBenfordDashboard.bind(fraudController));
router.get('/benford/comprehensive', fraudController.runComprehensiveBenfordAnalysis.bind(fraudController));
router.get('/benford/:analysisId/report', fraudController.getBenfordAnalysisReport.bind(fraudController));
router.get('/benford/trends', fraudController.getBenfordTrends.bind(fraudController));

export default router;