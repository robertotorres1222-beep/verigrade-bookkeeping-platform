import { Router } from 'express';
import cohortAnalysisController from '../controllers/cohortAnalysisController';

const router = Router();

// Cohort Management
router.post('/cohort/:userId', cohortAnalysisController.createCohort);

// Cohort Analysis
router.get('/retention/:userId/:cohortId', cohortAnalysisController.analyzeCohortRetention);
router.get('/revenue/:userId/:cohortId', cohortAnalysisController.calculateCohortRevenue);
router.get('/expansion/:userId/:cohortId', cohortAnalysisController.trackCohortExpansion);
router.get('/churn/:userId/:cohortId', cohortAnalysisController.analyzeCohortChurn);
router.get('/ltv/:userId/:cohortId', cohortAnalysisController.calculateCohortLTV);

// Cohort Comparison
router.post('/comparison/:userId', cohortAnalysisController.generateCohortComparisonReport);

export default router;







