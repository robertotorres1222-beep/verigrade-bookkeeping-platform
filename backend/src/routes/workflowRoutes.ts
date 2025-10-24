import express from 'express';
import {
  getWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  runWorkflow,
  getWorkflowExecutions
} from '../controllers/workflowController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Workflow CRUD operations
router.get('/', getWorkflows);
router.get('/executions', getWorkflowExecutions);
router.get('/:id', getWorkflow);
router.post('/', createWorkflow);
router.put('/:id', updateWorkflow);
router.delete('/:id', deleteWorkflow);

// Workflow execution
router.post('/:id/run', runWorkflow);

export default router;

