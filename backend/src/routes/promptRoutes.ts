import { Router } from 'express';
import { PromptController } from '../controllers/promptController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all prompts with optional filtering
router.get('/', PromptController.getPrompts);

// Get prompt categories
router.get('/categories', PromptController.getCategories);

// Get specific prompt by ID
router.get('/:id', PromptController.getPromptById);

// Execute a prompt with user data
router.post('/:id/execute', PromptController.executePrompt);

// Save customized prompt version
router.post('/:id/customize', PromptController.saveCustomPrompt);

// Get execution history
router.get('/history/executions', PromptController.getExecutionHistory);

export default router;




