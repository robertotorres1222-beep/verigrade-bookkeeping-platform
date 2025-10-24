import { Router } from 'express';
import {
  getFinancialHealthScore,
  getHealthScoreHistory,
  getPeerComparison,
  getRecommendations
} from '../controllers/financialHealthScoreController';

const router = Router();

/**
 * @route GET /api/financial-health-score/:companyId
 * @desc Get financial health score for a company
 * @access Private
 */
router.get('/:companyId', getFinancialHealthScore);

/**
 * @route GET /api/financial-health-score/:companyId/history
 * @desc Get health score history for a company
 * @access Private
 */
router.get('/:companyId/history', getHealthScoreHistory);

/**
 * @route GET /api/financial-health-score/:companyId/peer-comparison
 * @desc Get peer comparison data
 * @access Private
 */
router.get('/:companyId/peer-comparison', getPeerComparison);

/**
 * @route GET /api/financial-health-score/:companyId/recommendations
 * @desc Get recommendations for improving health score
 * @access Private
 */
router.get('/:companyId/recommendations', getRecommendations);

export default router;





