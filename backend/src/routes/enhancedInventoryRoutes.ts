import express from 'express';
import {
  createInventoryItem,
  createInventoryLocation,
  createInventoryTransaction,
  transferInventory,
  getSerialNumberTracking,
  getBatchTracking,
  getMultiLocationStock,
  getInventoryValuation,
  getInventoryAlerts,
  getInventoryReports
} from '../controllers/enhancedInventoryController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Inventory items
router.post('/items', createInventoryItem);

// Inventory locations
router.post('/locations', createInventoryLocation);

// Inventory transactions
router.post('/transactions', createInventoryTransaction);

// Inventory transfers
router.post('/transfer', transferInventory);

// Serial number tracking
router.get('/serial-numbers', getSerialNumberTracking);

// Batch tracking
router.get('/batches', getBatchTracking);

// Multi-location stock
router.get('/stock-levels', getMultiLocationStock);

// Inventory valuation
router.get('/valuation', getInventoryValuation);

// Inventory alerts
router.get('/alerts', getInventoryAlerts);

// Inventory reports
router.get('/reports', getInventoryReports);

export default router;