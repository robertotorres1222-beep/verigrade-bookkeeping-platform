import { Router } from 'express';
import { srePracticesController } from '../controllers/srePracticesController';

const router = Router();

// SLO Management Routes
router.post('/slos', srePracticesController.createSLO);
router.get('/slos', srePracticesController.getSLOs);
router.put('/slos/:id', srePracticesController.updateSLO);

// SLI Management Routes
router.post('/slis', srePracticesController.recordSLI);
router.get('/slos/:sloId/slis', srePracticesController.getSLIs);

// Error Budget Management Routes
router.get('/error-budgets', srePracticesController.getErrorBudgets);

// Chaos Engineering Routes
router.post('/chaos-experiments', srePracticesController.createChaosExperiment);
router.get('/chaos-experiments', srePracticesController.getChaosExperiments);
router.post('/chaos-experiments/:id/run', srePracticesController.runChaosExperiment);

// Performance Testing Routes
router.post('/performance-tests', srePracticesController.createPerformanceTest);
router.get('/performance-tests', srePracticesController.getPerformanceTests);
router.post('/performance-tests/:id/run', srePracticesController.runPerformanceTest);

// Incident Management Routes
router.post('/incidents', srePracticesController.createIncident);
router.get('/incidents', srePracticesController.getIncidents);
router.put('/incidents/:id', srePracticesController.updateIncident);

// Runbook Management Routes
router.post('/runbooks', srePracticesController.createRunbook);
router.get('/runbooks', srePracticesController.getRunbooks);

// Post-Mortem Management Routes
router.post('/post-mortems', srePracticesController.createPostMortem);
router.get('/post-mortems', srePracticesController.getPostMortems);

// Toil Management Routes
router.post('/toils', srePracticesController.createToil);
router.get('/toils', srePracticesController.getToils);

// Analytics and Reporting Routes
router.get('/analytics', srePracticesController.getSREAnalytics);

export default router;



