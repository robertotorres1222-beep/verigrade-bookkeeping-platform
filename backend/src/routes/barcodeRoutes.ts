import express from 'express';
import {
  scanBarcode,
  lookupProduct,
  generateBarcode,
  getSupportedFormats,
  validateBarcode,
  batchScan,
  addProductToInventory,
  updateInventoryQuantity,
  getInventoryItems,
  getInventoryItemByBarcode,
  getInventoryTransactions,
  upload,
} from '../controllers/barcodeController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Barcode scanning
router.post('/scan', upload.single('image'), scanBarcode);
router.post('/batch-scan', upload.array('images', 10), batchScan);
router.get('/lookup/:barcode', lookupProduct);

// Barcode generation
router.post('/generate', generateBarcode);

// Barcode utilities
router.get('/formats', getSupportedFormats);
router.post('/validate', validateBarcode);

// Inventory management
router.post('/inventory/add', addProductToInventory);
router.put('/inventory/:id/quantity', updateInventoryQuantity);
router.get('/inventory', getInventoryItems);
router.get('/inventory/barcode/:barcode', getInventoryItemByBarcode);
router.get('/inventory/transactions', getInventoryTransactions);

export default router;

