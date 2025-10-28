import { Router } from 'express';
import {
  getCollectionsDashboard,
  getARAgingReport,
  getCustomerPriorities,
  getDSO,
  getCollectionRate,
  getBadDebtRate,
  processDunningSequence,
  getDunningTemplates,
  getRecentActivity,
  getSuccessMetrics
} from '../controllers/collectionsController';

const router = Router();

/**
 * @route GET /api/collections/:companyId/dashboard
 * @desc Get collections dashboard
 * @access Private
 */
router.get('/:companyId/dashboard', getCollectionsDashboard);

/**
 * @route GET /api/collections/:companyId/aging
 * @desc Get AR aging report
 * @access Private
 */
router.get('/:companyId/aging', getARAgingReport);

/**
 * @route GET /api/collections/:companyId/priorities
 * @desc Get customer priorities
 * @access Private
 */
router.get('/:companyId/priorities', getCustomerPriorities);

/**
 * @route GET /api/collections/:companyId/dso
 * @desc Get DSO (Days Sales Outstanding)
 * @access Private
 */
router.get('/:companyId/dso', getDSO);

/**
 * @route GET /api/collections/:companyId/collection-rate
 * @desc Get collection rate
 * @access Private
 */
router.get('/:companyId/collection-rate', getCollectionRate);

/**
 * @route GET /api/collections/:companyId/bad-debt-rate
 * @desc Get bad debt rate
 * @access Private
 */
router.get('/:companyId/bad-debt-rate', getBadDebtRate);

/**
 * @route POST /api/collections/process-dunning
 * @desc Process dunning sequence
 * @access Private
 */
router.post('/process-dunning', processDunningSequence);

/**
 * @route GET /api/collections/templates
 * @desc Get dunning templates
 * @access Private
 */
router.get('/templates', getDunningTemplates);

/**
 * @route GET /api/collections/:companyId/activity
 * @desc Get recent collections activity
 * @access Private
 */
router.get('/:companyId/activity', getRecentActivity);

/**
 * @route GET /api/collections/:companyId/success-metrics
 * @desc Get success metrics
 * @access Private
 */
router.get('/:companyId/success-metrics', getSuccessMetrics);

export default router;









