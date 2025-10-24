import express from 'express';
import {
  createBOM,
  addBOMItem,
  getBOMs,
  createProductionOrder,
  updateProductionOrder,
  getProductionOrders,
  calculateProductionCost,
  getProductionDashboard
} from '../controllers/manufacturingController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// BOM (Bill of Materials) routes
router.post('/boms', createBOM);
router.post('/boms/:bomId/items', addBOMItem);
router.get('/boms', getBOMs);

// Production order routes
router.post('/production-orders', createProductionOrder);
router.put('/production-orders/:id', updateProductionOrder);
router.get('/production-orders', getProductionOrders);

// Cost calculation
router.get('/cost-calculation', calculateProductionCost);

// Dashboard
router.get('/dashboard', getProductionDashboard);

export default router;

