import { Router } from 'express';
import scenarioModelingController from '../controllers/scenarioModelingController';

const router = Router();

// Scenario Modeling
router.post('/what-if/:userId', scenarioModelingController.runWhatIfScenario);
router.post('/price-increase/:userId', scenarioModelingController.modelPriceIncreaseImpact);
router.post('/churn-reduction/:userId', scenarioModelingController.modelChurnReductionScenario);
router.post('/funding-runway/:userId', scenarioModelingController.calculateFundingRunway);
router.post('/break-even/:userId', scenarioModelingController.projectBreakEvenTimeline);
router.post('/hiring-impact/:userId', scenarioModelingController.analyzeHiringImpact);
router.post('/expense-optimization/:userId', scenarioModelingController.modelExpenseOptimization);
router.post('/growth-trajectory/:userId', scenarioModelingController.modelGrowthTrajectory);

// Dashboard
router.get('/dashboard/:userId', scenarioModelingController.getScenarioDashboard);

export default router;






