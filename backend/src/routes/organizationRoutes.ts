import { Router } from 'express';
import {
  getOrganization,
  updateOrganization,
  getSettings,
  updateSettings
} from '../controllers/organizationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All organization routes require authentication
router.use(authenticateToken);

router.get('/', (req, res) => getOrganization(req as any, res));
router.put('/', (req, res) => updateOrganization(req as any, res));
router.get('/settings', (req, res) => getSettings(req as any, res));
router.put('/settings', (req, res) => updateSettings(req as any, res));

export default router;
