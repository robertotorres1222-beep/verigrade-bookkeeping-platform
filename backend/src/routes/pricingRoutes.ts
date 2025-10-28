import { Router } from 'express';
import {
  getPricingAnalysis,
  getWillingnessToPay,
  getWTPRecommendations,
  getSegmentWTP,
  getFeatureWTP,
  getWTPTrends,
  getValueBasedPricing,
  getAnnualDiscountOptimization,
  getGrandfatherPricingRisk,
  getUsageBasedPricing,
  getPriceElasticity,
  getABTestRecommendations
} from '../controllers/pricingController';

const router = Router();

/**
 * @route GET /api/pricing/:companyId/analysis
 * @desc Get comprehensive pricing analysis
 * @access Private
 */
router.get('/:companyId/analysis', getPricingAnalysis);

/**
 * @route GET /api/pricing/:companyId/willingness-to-pay
 * @desc Get willingness to pay analysis
 * @access Private
 */
router.get('/:companyId/willingness-to-pay', getWillingnessToPay);

/**
 * @route GET /api/pricing/:companyId/wtp-recommendations
 * @desc Get WTP-based recommendations
 * @access Private
 */
router.get('/:companyId/wtp-recommendations', getWTPRecommendations);

/**
 * @route GET /api/pricing/:companyId/segment/:segment/wtp
 * @desc Get WTP for specific segment
 * @access Private
 */
router.get('/:companyId/segment/:segment/wtp', getSegmentWTP);

/**
 * @route GET /api/pricing/:companyId/feature/:feature/wtp
 * @desc Get WTP for specific feature
 * @access Private
 */
router.get('/:companyId/feature/:feature/wtp', getFeatureWTP);

/**
 * @route GET /api/pricing/:companyId/wtp-trends
 * @desc Get WTP trends over time
 * @access Private
 */
router.get('/:companyId/wtp-trends', getWTPTrends);

/**
 * @route GET /api/pricing/:companyId/value-based-pricing
 * @desc Get value-based pricing recommendations
 * @access Private
 */
router.get('/:companyId/value-based-pricing', getValueBasedPricing);

/**
 * @route GET /api/pricing/:companyId/annual-discount-optimization
 * @desc Get annual discount optimization
 * @access Private
 */
router.get('/:companyId/annual-discount-optimization', getAnnualDiscountOptimization);

/**
 * @route GET /api/pricing/:companyId/grandfather-pricing-risk
 * @desc Get grandfather pricing risk assessment
 * @access Private
 */
router.get('/:companyId/grandfather-pricing-risk', getGrandfatherPricingRisk);

/**
 * @route GET /api/pricing/:companyId/usage-based-pricing
 * @desc Get usage-based pricing analysis
 * @access Private
 */
router.get('/:companyId/usage-based-pricing', getUsageBasedPricing);

/**
 * @route GET /api/pricing/:companyId/price-elasticity
 * @desc Get price elasticity analysis
 * @access Private
 */
router.get('/:companyId/price-elasticity', getPriceElasticity);

/**
 * @route GET /api/pricing/:companyId/ab-test-recommendations
 * @desc Get A/B test recommendations
 * @access Private
 */
router.get('/:companyId/ab-test-recommendations', getABTestRecommendations);

export default router;









