import { Router } from 'express';
import { RecurringController } from '../controllers/recurringController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const recurringController = new RecurringController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/recurring/dashboard
 * @desc Get recurring dashboard
 * @access Private
 */
router.get('/dashboard', recurringController.getRecurringDashboard);

/**
 * @route GET /api/recurring/templates
 * @desc Get recurring templates
 * @access Private
 */
router.get('/templates', recurringController.getRecurringTemplates);

/**
 * @route GET /api/recurring/templates/:templateId
 * @desc Get recurring template by ID
 * @access Private
 */
router.get('/templates/:templateId', recurringController.getRecurringTemplate);

/**
 * @route POST /api/recurring/templates
 * @desc Create recurring template
 * @access Private
 */
router.post('/templates', recurringController.createRecurringTemplate);

/**
 * @route PUT /api/recurring/templates/:templateId
 * @desc Update recurring template
 * @access Private
 */
router.put('/templates/:templateId', recurringController.updateRecurringTemplate);

/**
 * @route DELETE /api/recurring/templates/:templateId
 * @desc Delete recurring template
 * @access Private
 */
router.delete('/templates/:templateId', recurringController.deleteRecurringTemplate);

/**
 * @route POST /api/recurring/templates/:templateId/test
 * @desc Test recurring template
 * @access Private
 */
router.post('/templates/:templateId/test', recurringController.testRecurringTemplate);

/**
 * @route POST /api/recurring/generate
 * @desc Generate recurring items
 * @access Private
 */
router.post('/generate', recurringController.generateRecurringItems);

/**
 * @route GET /api/recurring/stats
 * @desc Get template statistics
 * @access Private
 */
router.get('/stats', recurringController.getTemplateStats);

/**
 * @route GET /api/recurring/recent
 * @desc Get recent templates
 * @access Private
 */
router.get('/recent', recurringController.getRecentTemplates);

/**
 * @route GET /api/recurring/logs
 * @desc Get generation logs
 * @access Private
 */
router.get('/logs', recurringController.getGenerationLogs);

/**
 * @route GET /api/recurring/upcoming
 * @desc Get upcoming items
 * @access Private
 */
router.get('/upcoming', recurringController.getUpcomingItems);

/**
 * @route GET /api/recurring/analytics
 * @desc Get recurring analytics
 * @access Private
 */
router.get('/analytics', recurringController.getRecurringAnalytics);

/**
 * @route GET /api/recurring/insights
 * @desc Get recurring insights
 * @access Private
 */
router.get('/insights', recurringController.getRecurringInsights);

export default router;