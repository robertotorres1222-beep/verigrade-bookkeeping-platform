import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Task management routes
router.post('/tasks', authenticate, taskController.createTask);
router.get('/tasks', authenticate, taskController.getTasks);
router.put('/tasks/:taskId', authenticate, taskController.updateTask);
router.put('/tasks/:taskId/complete', authenticate, taskController.completeTask);
router.get('/task-templates', authenticate, taskController.getTaskTemplates);
router.post('/task-templates/:templateId/create-task', authenticate, taskController.createTaskFromTemplate);
router.get('/tasks/statistics', authenticate, taskController.getTaskStatistics);

export default router;

