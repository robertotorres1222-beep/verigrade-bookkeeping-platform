import { Router } from 'express';
import {
  getVendorAnalysis,
  getVendorOptimization,
  getSavingsOpportunities,
  createSavingsOpportunity,
  updateOpportunityStatus,
  startSavingsTracking,
  updateSavingsTracking,
  completeSavingsTracking,
  getSavingsTracking,
  getSavingsSummary,
  getNegotiationTriggers
} from '../controllers/vendorOptimizationController';

const router = Router();

/**
 * @route GET /api/vendor-optimization/:companyId/analysis
 * @desc Get vendor analysis
 * @access Private
 */
router.get('/:companyId/analysis', getVendorAnalysis);

/**
 * @route GET /api/vendor-optimization/vendor/:vendorId/optimization
 * @desc Get vendor optimization opportunities
 * @access Private
 */
router.get('/vendor/:vendorId/optimization', getVendorOptimization);

/**
 * @route GET /api/vendor-optimization/:companyId/opportunities
 * @desc Get savings opportunities
 * @access Private
 */
router.get('/:companyId/opportunities', getSavingsOpportunities);

/**
 * @route POST /api/vendor-optimization/opportunities
 * @desc Create savings opportunity
 * @access Private
 */
router.post('/opportunities', createSavingsOpportunity);

/**
 * @route PUT /api/vendor-optimization/opportunities/:opportunityId/status
 * @desc Update opportunity status
 * @access Private
 */
router.put('/opportunities/:opportunityId/status', updateOpportunityStatus);

/**
 * @route POST /api/vendor-optimization/opportunities/:opportunityId/tracking
 * @desc Start savings tracking
 * @access Private
 */
router.post('/opportunities/:opportunityId/tracking', startSavingsTracking);

/**
 * @route PUT /api/vendor-optimization/opportunities/:opportunityId/tracking
 * @desc Update savings tracking
 * @access Private
 */
router.put('/opportunities/:opportunityId/tracking', updateSavingsTracking);

/**
 * @route POST /api/vendor-optimization/opportunities/:opportunityId/tracking/complete
 * @desc Complete savings tracking
 * @access Private
 */
router.post('/opportunities/:opportunityId/tracking/complete', completeSavingsTracking);

/**
 * @route GET /api/vendor-optimization/opportunities/:opportunityId/tracking
 * @desc Get savings tracking
 * @access Private
 */
router.get('/opportunities/:opportunityId/tracking', getSavingsTracking);

/**
 * @route GET /api/vendor-optimization/:companyId/summary
 * @desc Get savings summary
 * @access Private
 */
router.get('/:companyId/summary', getSavingsSummary);

/**
 * @route GET /api/vendor-optimization/:companyId/negotiation-triggers
 * @desc Get negotiation triggers
 * @access Private
 */
router.get('/:companyId/negotiation-triggers', getNegotiationTriggers);

export default router;









