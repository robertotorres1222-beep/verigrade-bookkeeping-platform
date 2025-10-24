import { Router } from 'express';
import cashFlowForecastController from '../controllers/cashFlowForecastController';

const router = Router();

// Cash Flow Forecasting
router.get('/forecast/:userId', cashFlowForecastController.generateCashFlowForecast);

// Pattern Analysis
router.get('/renewal-patterns/:userId', cashFlowForecastController.analyzeRenewalPatterns);
router.get('/seasonal-trends/:userId', cashFlowForecastController.detectSeasonalTrends);

// Scenario Modeling
router.post('/churn-scenarios/:userId', cashFlowForecastController.modelChurnScenarios);
router.post('/what-if/:userId', cashFlowForecastController.runWhatIfScenario);
router.get('/monte-carlo/:userId', cashFlowForecastController.runMonteCarloSimulation);

// Runway and Alerts
router.post('/runway/:userId', cashFlowForecastController.calculateRunway);
router.get('/shortage-alerts/:userId', cashFlowForecastController.checkCashShortageAlerts);

export default router;






