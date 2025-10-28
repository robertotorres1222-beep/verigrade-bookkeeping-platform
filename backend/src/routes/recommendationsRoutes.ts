import express from 'express';
import recommendationsController from '../controllers/recommendationsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/ai/recommendations/:userId
 * @desc Get all recommendations for user
 * @access Private
 */
router.get('/:userId', recommendationsController.getAllRecommendations);

/**
 * @route GET /api/ai/recommendations/vendor/:userId
 * @desc Get vendor optimization recommendations
 * @access Private
 */
router.get('/vendor/:userId', recommendationsController.getVendorOptimizationRecommendations);

/**
 * @route GET /api/ai/recommendations/billing/:userId
 * @desc Get billing optimization recommendations
 * @access Private
 */
router.get('/billing/:userId', recommendationsController.getBillingOptimizationRecommendations);

/**
 * @route GET /api/ai/recommendations/cashflow/:userId
 * @desc Get cash flow optimization recommendations
 * @access Private
 */
router.get('/cashflow/:userId', recommendationsController.getCashFlowOptimizationRecommendations);

/**
 * @route GET /api/ai/recommendations/staffing/:userId
 * @desc Get staffing recommendations
 * @access Private
 */
router.get('/staffing/:userId', recommendationsController.getStaffingRecommendations);

/**
 * @route POST /api/ai/recommendations/dismiss/:id
 * @desc Dismiss recommendation
 * @access Private
 */
router.post('/dismiss/:id', recommendationsController.dismissRecommendation);

/**
 * @route GET /api/ai/recommendations/analytics/:userId
 * @desc Get recommendation analytics
 * @access Private
 */
router.get('/analytics/:userId', recommendationsController.getRecommendationAnalytics);

/**
 * @route GET /api/ai/recommendations/priorities/:userId
 * @desc Get recommendation priorities
 * @access Private
 */
router.get('/priorities/:userId', recommendationsController.getRecommendationPriorities);

export default router;










