import { Router } from 'express';
import { BankFeedProcessingController } from '../controllers/bankFeedProcessingController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const bankFeedProcessingController = new BankFeedProcessingController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route POST /api/bank-feed-processing/process
 * @desc Process bank feed transactions
 * @access Private
 */
router.post('/process', bankFeedProcessingController.processBankFeed);

/**
 * @route GET /api/bank-feed-processing/dashboard
 * @desc Get bank feed processing dashboard
 * @access Private
 */
router.get('/dashboard', bankFeedProcessingController.getBankFeedProcessingDashboard);

/**
 * @route GET /api/bank-feed-processing/connections
 * @desc Get bank feed connections
 * @access Private
 */
router.get('/connections', bankFeedProcessingController.getBankFeedConnections);

/**
 * @route POST /api/bank-feed-processing/connections
 * @desc Create bank feed connection
 * @access Private
 */
router.post('/connections', bankFeedProcessingController.createBankFeedConnection);

/**
 * @route PUT /api/bank-feed-processing/connections/:connectionId
 * @desc Update bank feed connection
 * @access Private
 */
router.put('/connections/:connectionId', bankFeedProcessingController.updateBankFeedConnection);

/**
 * @route DELETE /api/bank-feed-processing/connections/:connectionId
 * @desc Delete bank feed connection
 * @access Private
 */
router.delete('/connections/:connectionId', bankFeedProcessingController.deleteBankFeedConnection);

/**
 * @route GET /api/bank-feed-processing/rules
 * @desc Get bank feed rules
 * @access Private
 */
router.get('/rules', bankFeedProcessingController.getBankFeedRules);

/**
 * @route POST /api/bank-feed-processing/rules
 * @desc Create bank feed rule
 * @access Private
 */
router.post('/rules', bankFeedProcessingController.createBankFeedRule);

/**
 * @route PUT /api/bank-feed-processing/rules/:ruleId
 * @desc Update bank feed rule
 * @access Private
 */
router.put('/rules/:ruleId', bankFeedProcessingController.updateBankFeedRule);

/**
 * @route DELETE /api/bank-feed-processing/rules/:ruleId
 * @desc Delete bank feed rule
 * @access Private
 */
router.delete('/rules/:ruleId', bankFeedProcessingController.deleteBankFeedRule);

/**
 * @route POST /api/bank-feed-processing/rules/test
 * @desc Test bank feed rule
 * @access Private
 */
router.post('/rules/test', bankFeedProcessingController.testBankFeedRule);

/**
 * @route GET /api/bank-feed-processing/stats
 * @desc Get processing statistics
 * @access Private
 */
router.get('/stats', bankFeedProcessingController.getProcessingStats);

/**
 * @route GET /api/bank-feed-processing/logs
 * @desc Get recent processing logs
 * @access Private
 */
router.get('/logs', bankFeedProcessingController.getRecentLogs);

/**
 * @route GET /api/bank-feed-processing/rule-stats
 * @desc Get rule statistics
 * @access Private
 */
router.get('/rule-stats', bankFeedProcessingController.getRuleStats);

/**
 * @route GET /api/bank-feed-processing/error-analysis
 * @desc Get error analysis
 * @access Private
 */
router.get('/error-analysis', bankFeedProcessingController.getErrorAnalysis);

/**
 * @route GET /api/bank-feed-processing/insights
 * @desc Get processing insights
 * @access Private
 */
router.get('/insights', bankFeedProcessingController.getProcessingInsights);

export default router;