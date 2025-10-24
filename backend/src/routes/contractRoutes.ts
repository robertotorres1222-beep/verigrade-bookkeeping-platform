import { Router } from 'express';
import {
  parseContractPDF,
  getContractAnalysis,
  getCompanyContracts,
  analyzeContractTerms,
  generateRevenueRecognitionSchedule,
  trackContractModification,
  identifyUpsellOpportunities,
  getRenewalCalendar,
  getContractRiskDashboard,
  getUpcomingRenewals,
  updateContractAnalysis,
  upload
} from '../controllers/contractController';

const router = Router();

// Contract parsing routes
router.post('/parse-pdf/:companyId', upload.single('pdf'), parseContractPDF);
router.get('/analysis/:contractId', getContractAnalysis);
router.get('/company/:companyId', getCompanyContracts);
router.put('/analysis/:contractId', updateContractAnalysis);

// Contract analysis routes
router.get('/terms/:contractId', analyzeContractTerms);
router.get('/revenue-schedule/:contractId', generateRevenueRecognitionSchedule);
router.get('/upsell-opportunities/:contractId', identifyUpsellOpportunities);
router.get('/renewal-calendar/:companyId', getRenewalCalendar);
router.get('/risk-dashboard/:companyId', getContractRiskDashboard);
router.get('/upcoming-renewals/:companyId', getUpcomingRenewals);

// Contract modification tracking
router.post('/modification/:contractId', trackContractModification);

export default router;






