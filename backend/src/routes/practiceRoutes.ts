import { Router } from 'express';
import { practiceController } from '../controllers/practiceController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Practice management routes
router.post('/practice', authenticate, practiceController.createPractice);
router.get('/practice/:practiceId/dashboard', authenticate, practiceController.getDashboard);
router.get('/practice/:practiceId/clients', authenticate, practiceController.getClients);
router.post('/practice/:practiceId/clients', authenticate, practiceController.addClient);
router.get('/practice/:practiceId/clients/:clientId', authenticate, practiceController.getClient);
router.put('/practice/:practiceId/clients/:clientId', authenticate, practiceController.updateClient);
router.get('/practice/:practiceId/team', authenticate, practiceController.getTeam);
router.post('/practice/:practiceId/team', authenticate, practiceController.addStaffMember);
router.post('/practice/:practiceId/team/assign', authenticate, practiceController.assignStaff);

export default router;

