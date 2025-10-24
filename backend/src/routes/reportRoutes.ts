import { Router } from 'express';
import { reportController } from '../controllers/reportController';

const router = Router();

// Report management routes
router.get('/', reportController.getReports);
router.get('/:id', reportController.getReport);
router.post('/', reportController.createReport);
router.put('/:id', reportController.updateReport);
router.delete('/:id', reportController.deleteReport);

export default router;

