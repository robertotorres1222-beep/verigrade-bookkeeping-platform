import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController';

const router = Router();

// Product Management
router.post('/products', inventoryController.createProduct);
router.get('/products', inventoryController.getProducts);
router.get('/products/:id', inventoryController.getProduct);
router.put('/products/:id', inventoryController.updateProduct);
router.delete('/products/:id', inventoryController.deleteProduct);

// Stock Management
router.put('/products/:productId/stock', inventoryController.updateStock);
router.get('/stock-levels', inventoryController.getStockLevels);

// Purchase Orders
router.post('/purchase-orders', inventoryController.createPurchaseOrder);
router.get('/purchase-orders', inventoryController.getPurchaseOrders);
router.put('/purchase-orders/:id', inventoryController.updatePurchaseOrder);

// COGS Calculations
router.get('/products/:productId/cogs', inventoryController.calculateCOGS);

// Low Stock Alerts
router.get('/low-stock-alerts', inventoryController.getLowStockAlerts);

// Inventory Analytics
router.get('/analytics', inventoryController.getInventoryAnalytics);

export default router;