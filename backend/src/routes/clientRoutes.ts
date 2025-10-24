import { Router } from 'express';
import { clientController } from '../controllers/clientController';

const router = Router();

// Client management routes
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClient);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

export default router;

