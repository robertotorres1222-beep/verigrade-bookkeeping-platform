import { Router } from 'express';
import {
  generateInvestorReport,
  getInvestorReport,
  generatePowerPoint,
  generatePDF,
  generateGoogleSlides,
  generateOnePageSummary,
  scheduleMonthlyDelivery,
  getSlideTemplates,
  getCompanyReports
} from '../controllers/investorReportingController';

const router = Router();

/**
 * @route POST /api/investor-reporting/generate
 * @desc Generate investor report
 * @access Private
 */
router.post('/generate', generateInvestorReport);

/**
 * @route GET /api/investor-reporting/:reportId
 * @desc Get investor report
 * @access Private
 */
router.get('/:reportId', getInvestorReport);

/**
 * @route GET /api/investor-reporting/:reportId/powerpoint
 * @desc Generate PowerPoint presentation
 * @access Private
 */
router.get('/:reportId/powerpoint', generatePowerPoint);

/**
 * @route GET /api/investor-reporting/:reportId/pdf
 * @desc Generate PDF version
 * @access Private
 */
router.get('/:reportId/pdf', generatePDF);

/**
 * @route GET /api/investor-reporting/:reportId/google-slides
 * @desc Generate Google Slides
 * @access Private
 */
router.get('/:reportId/google-slides', generateGoogleSlides);

/**
 * @route GET /api/investor-reporting/:reportId/summary
 * @desc Generate one-page summary
 * @access Private
 */
router.get('/:reportId/summary', generateOnePageSummary);

/**
 * @route POST /api/investor-reporting/schedule
 * @desc Schedule monthly report delivery
 * @access Private
 */
router.post('/schedule', scheduleMonthlyDelivery);

/**
 * @route GET /api/investor-reporting/templates
 * @desc Get slide templates
 * @access Private
 */
router.get('/templates', getSlideTemplates);

/**
 * @route GET /api/investor-reporting/company/:companyId
 * @desc Get company reports
 * @access Private
 */
router.get('/company/:companyId', getCompanyReports);

export default router;









