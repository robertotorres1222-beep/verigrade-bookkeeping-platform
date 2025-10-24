import { Router } from 'express';
import { MLCategorizationController } from '../controllers/mlCategorizationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const mlCategorizationController = new MLCategorizationController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route POST /api/ml-categorization/transaction/:transactionId/categorize
 * @desc Categorize a transaction using ML
 * @access Private
 */
router.post('/transaction/:transactionId/categorize', mlCategorizationController.categorizeTransaction);

/**
 * @route POST /api/ml-categorization/categorization/:categorizationId/feedback
 * @desc Provide feedback on categorization
 * @access Private
 */
router.post('/categorization/:categorizationId/feedback', mlCategorizationController.provideFeedback);

/**
 * @route GET /api/ml-categorization/dashboard
 * @desc Get categorization dashboard
 * @access Private
 */
router.get('/dashboard', mlCategorizationController.getCategorizationDashboard);

/**
 * @route GET /api/ml-categorization/performance
 * @desc Get categorization performance metrics
 * @access Private
 */
router.get('/performance', mlCategorizationController.getCategorizationPerformance);

/**
 * @route GET /api/ml-categorization/recent
 * @desc Get recent categorizations
 * @access Private
 */
router.get('/recent', mlCategorizationController.getRecentCategorizations);

/**
 * @route GET /api/ml-categorization/top-categories
 * @desc Get top categories
 * @access Private
 */
router.get('/top-categories', mlCategorizationController.getTopCategories);

/**
 * @route GET /api/ml-categorization/accuracy-trends
 * @desc Get accuracy trends
 * @access Private
 */
router.get('/accuracy-trends', mlCategorizationController.getAccuracyTrends);

/**
 * @route GET /api/ml-categorization/stats
 * @desc Get categorization statistics
 * @access Private
 */
router.get('/stats', mlCategorizationController.getCategorizationStats);

/**
 * @route GET /api/ml-categorization/accuracy
 * @desc Get categorization accuracy
 * @access Private
 */
router.get('/accuracy', mlCategorizationController.getCategorizationAccuracy);

/**
 * @route GET /api/ml-categorization/confidence-distribution
 * @desc Get confidence distribution
 * @access Private
 */
router.get('/confidence-distribution', mlCategorizationController.getConfidenceDistribution);

/**
 * @route GET /api/ml-categorization/methods
 * @desc Get categorization methods breakdown
 * @access Private
 */
router.get('/methods', mlCategorizationController.getCategorizationMethods);

/**
 * @route GET /api/ml-categorization/feedback-summary
 * @desc Get feedback summary
 * @access Private
 */
router.get('/feedback-summary', mlCategorizationController.getFeedbackSummary);

/**
 * @route GET /api/ml-categorization/model-performance
 * @desc Get model performance
 * @access Private
 */
router.get('/model-performance', mlCategorizationController.getModelPerformance);

/**
 * @route GET /api/ml-categorization/insights
 * @desc Get categorization insights
 * @access Private
 */
router.get('/insights', mlCategorizationController.getCategorizationInsights);

export default router;