import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

router.get('/', (req, res) => getUsers(req as any, res));
router.get('/:id', (req, res) => getUser(req as any, res));
router.put('/:id', (req, res) => updateUser(req as any, res));
router.delete('/:id', (req, res) => deleteUser(req as any, res));

export default router;
