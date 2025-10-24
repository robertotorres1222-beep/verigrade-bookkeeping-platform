import express from 'express';
import {
  getDashboard,
  getProjects,
  createProject,
  getExpenses,
  createExpense,
  getLaborEntries,
  createLaborEntry,
  getMaterialEntries,
  createMaterialEntry
} from '../controllers/jobCostingController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Dashboard
router.get('/dashboard', getDashboard);

// Projects
router.get('/projects', getProjects);
router.post('/projects', createProject);

// Expenses
router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);

// Labor
router.get('/labor', getLaborEntries);
router.post('/labor', createLaborEntry);

// Materials
router.get('/materials', getMaterialEntries);
router.post('/materials', createMaterialEntry);

export default router;