import { Router } from 'express';
import { clientRequestController } from '../controllers/clientRequestController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Client request routes
router.post('/client-requests', authenticate, clientRequestController.createRequest);
router.get('/client-requests', authenticate, clientRequestController.getRequests);
router.put('/client-requests/:requestId', authenticate, clientRequestController.updateRequest);
router.put('/client-requests/:requestId/assign', authenticate, clientRequestController.assignRequest);
router.put('/client-requests/:requestId/complete', authenticate, clientRequestController.completeRequest);
router.get('/client-requests/statistics', authenticate, clientRequestController.getRequestStatistics);

export default router;

