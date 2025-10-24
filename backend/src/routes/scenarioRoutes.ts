import { Router } from 'express';
import { scenarioController } from '../controllers/scenarioController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Scenario routes
router.post('/scenarios', authenticate, scenarioController.createScenario);
router.get('/scenarios', authenticate, scenarioController.getScenarios);
router.post('/scenarios/:scenarioId/analyze', authenticate, scenarioController.runScenarioAnalysis);
router.post('/scenarios/compare', authenticate, scenarioController.compareScenarios);
router.get('/scenario-templates', authenticate, scenarioController.getScenarioTemplates);
router.post('/scenario-templates/:templateId/create', authenticate, scenarioController.createScenarioFromTemplate);

export default router;

