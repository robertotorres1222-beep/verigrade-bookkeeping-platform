import { Router } from 'express';
import { completeInventoryController } from '../controllers/completeInventoryController';

const router = Router();

// Product Management Routes
router.post('/products', completeInventoryController.createProduct);
router.get('/products', completeInventoryController.getProducts);
router.get('/products/:id', completeInventoryController.getProduct);
router.put('/products/:id', completeInventoryController.updateProduct);
router.delete('/products/:id', completeInventoryController.deleteProduct);

// Warehouse Management Routes
router.post('/warehouses', completeInventoryController.createWarehouse);
router.get('/warehouses', completeInventoryController.getWarehouses);
router.put('/warehouses/:id', completeInventoryController.updateWarehouse);

// Bin Location Management Routes
router.post('/bin-locations', completeInventoryController.createBinLocation);
router.get('/warehouses/:warehouseId/bin-locations', completeInventoryController.getBinLocations);

// Inventory Management Routes
router.get('/inventory', completeInventoryController.getInventory);
router.put('/inventory/:productId/:warehouseId/quantity', completeInventoryController.updateInventoryQuantity);

// Purchase Order Management Routes
router.post('/purchase-orders', completeInventoryController.createPurchaseOrder);
router.get('/purchase-orders', completeInventoryController.getPurchaseOrders);
router.post('/purchase-orders/:id/receive', completeInventoryController.receivePurchaseOrder);

// Cost Layer Management Routes
router.get('/products/:productId/cost-layers', completeInventoryController.getCostLayers);

// Inventory Forecasting Routes
router.post('/products/:productId/forecast', completeInventoryController.generateInventoryForecast);

// Inventory Adjustments Routes
router.post('/inventory-adjustments', completeInventoryController.createInventoryAdjustment);
router.post('/inventory-adjustments/:id/approve', completeInventoryController.approveInventoryAdjustment);

// Inventory Transfers Routes
router.post('/inventory-transfers', completeInventoryController.createInventoryTransfer);
router.post('/inventory-transfers/:id/complete', completeInventoryController.completeInventoryTransfer);

// Analytics and Reporting Routes
router.get('/analytics', completeInventoryController.getInventoryAnalytics);

export default router;




