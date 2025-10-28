import express from 'express';
import aiFinancialAdvisorController from '../controllers/aiFinancialAdvisorController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/ai/advisor/tax/:userId
 * @desc Get tax optimization recommendations
 * @access Private
 */
router.get('/tax/:userId', aiFinancialAdvisorController.getTaxOptimizationRecommendations);

/**
 * @route GET /api/ai/advisor/pricing/:userId
 * @desc Get pricing strategy recommendations
 * @access Private
 */
router.get('/pricing/:userId', aiFinancialAdvisorController.getPricingStrategyRecommendations);

/**
 * @route GET /api/ai/advisor/investment/:userId
 * @desc Get investment recommendations
 * @access Private
 */
router.get('/investment/:userId', aiFinancialAdvisorController.getInvestmentRecommendations);

/**
 * @route GET /api/ai/advisor/strategy/:userId
 * @desc Get business strategy recommendations
 * @access Private
 */
router.get('/strategy/:userId', aiFinancialAdvisorController.getBusinessStrategyRecommendations);

/**
 * @route GET /api/ai/advisor/all/:userId
 * @desc Get all financial advisor recommendations
 * @access Private
 */
router.get('/all/:userId', aiFinancialAdvisorController.getAllFinancialAdvisorRecommendations);

/**
 * @route GET /api/ai/advisor/dashboard/:userId
 * @desc Get financial advisor dashboard
 * @access Private
 */
router.get('/dashboard/:userId', aiFinancialAdvisorController.getFinancialAdvisorDashboard);

/**
 * @route GET /api/ai/advisor/analytics/:userId
 * @desc Get financial advisor analytics
 * @access Private
 */
router.get('/analytics/:userId', aiFinancialAdvisorController.getFinancialAdvisorAnalytics);

/**
 * @route GET /api/ai/advisor/priorities/:userId
 * @desc Get financial advisor priorities
 * @access Private
 */
router.get('/priorities/:userId', aiFinancialAdvisorController.getFinancialAdvisorPriorities);

export default router;










