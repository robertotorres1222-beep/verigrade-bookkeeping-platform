import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import { sendEmail } from '../services/emailService';
import { logger } from '../utils/logger';

const router = Router();

// Mock Inventory Item interface
interface InventoryItem {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  sku: string;
  unitPrice: number;
  quantityOnHand: number;
  reorderPoint: number;
  supplierId?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock Purchase Order interface
interface PurchaseOrder {
  id: string;
  organizationId: string;
  supplierId: string;
  items: { itemId: string; quantity: number; unitCost: number }[];
  status: 'PENDING' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Mock COGS Entry interface
interface CogsEntry {
  id: string;
  organizationId: string;
  itemId: string;
  quantity: number;
  cost: number;
  date: string;
  transactionId?: string;
  createdAt: string;
}

// Create a new inventory item
router.post(
  '/items',
  authenticate,
  [
    body('name').isString().notEmpty(),
    body('sku').isString().notEmpty(),
    body('unitPrice').isFloat({ min: 0 }),
    body('quantityOnHand').isInt({ min: 0 }),
    body('reorderPoint').isInt({ min: 0 }),
    body('description').optional().isString(),
    body('supplierId').optional().isString(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { name, description, sku, unitPrice, quantityOnHand, reorderPoint, supplierId } = req.body;
    const organizationId = req.user!.organizationId;

    const productId = `prod_${Date.now()}`;

    const newItem: InventoryItem = {
      id: productId,
      organizationId,
      name,
      description,
      sku,
      unitPrice,
      quantityOnHand,
      reorderPoint,
      supplierId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info(`New product ${productId} created for organization ${organizationId}`);
    res.status(201).json({ success: true, data: newItem });
  })
);

// Get all inventory items for an organization
router.get(
  '/items',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    // Mock inventory items data
    const items: InventoryItem[] = [
      {
        id: 'inv_1',
        organizationId: 'org_1',
        name: 'Product A',
        sku: 'PA-001',
        unitPrice: 25.00,
        quantityOnHand: 150,
        reorderPoint: 50,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-10-01T00:00:00Z',
      },
      {
        id: 'inv_2',
        organizationId: 'org_1',
        name: 'Product B',
        sku: 'PB-002',
        unitPrice: 10.50,
        quantityOnHand: 30,
        reorderPoint: 40,
        createdAt: '2023-02-01T00:00:00Z',
        updatedAt: '2023-10-02T00:00:00Z',
      },
    ];

    res.status(200).json({ success: true, data: items });
  })
);

// Update inventory item quantity
router.put(
  '/items/:id/quantity',
  authenticate,
  [
    param('id').isString().notEmpty(),
    body('quantity').isInt({ min: 0 }),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const organizationId = req.user!.organizationId;

    const updatedItem: InventoryItem = {
      id,
      organizationId,
      name: 'Product X',
      sku: 'PX-001',
      unitPrice: 100.00,
      quantityOnHand: quantity,
      reorderPoint: 20,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    logger.info(`Inventory item ${id} quantity updated to ${quantity} for organization ${organizationId}`);
    res.status(200).json({ success: true, data: updatedItem });
  })
);

// Create a new purchase order
router.post(
  '/purchase-orders',
  authenticate,
  [
    body('supplierId').isString().notEmpty(),
    body('items').isArray().notEmpty(),
    body('items.*.itemId').isString().notEmpty(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('items.*.unitCost').isFloat({ min: 0 }),
    body('expectedDeliveryDate').optional().isISO8601().toDate(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { supplierId, items, expectedDeliveryDate } = req.body;
    const organizationId = req.user!.organizationId;

    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitCost), 0);

    const newPO: PurchaseOrder = {
      id: `po_${Date.now()}`,
      organizationId,
      supplierId,
      items,
      status: 'PENDING',
      orderDate: new Date().toISOString(),
      expectedDeliveryDate,
      totalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info(`New purchase order ${newPO.id} created for organization ${organizationId}`);
    res.status(201).json({ success: true, data: newPO });
  })
);

// Get all purchase orders
router.get(
  '/purchase-orders',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const purchaseOrders: PurchaseOrder[] = [
      {
        id: 'po_1',
        organizationId: 'org_1',
        supplierId: 'sup_1',
        items: [{ itemId: 'inv_2', quantity: 100, unitCost: 9.00 }],
        status: 'ORDERED',
        orderDate: '2023-09-25T00:00:00Z',
        expectedDeliveryDate: '2023-10-10T00:00:00Z',
        totalAmount: 900.00,
        createdAt: '2023-09-25T00:00:00Z',
        updatedAt: '2023-09-25T00:00:00Z',
      },
    ];

    res.status(200).json({ success: true, data: purchaseOrders });
  })
);

// Record a COGS entry
router.post(
  '/cogs',
  authenticate,
  [
    body('itemId').isString().notEmpty(),
    body('quantity').isInt({ min: 1 }),
    body('cost').isFloat({ min: 0 }),
    body('date').isISO8601().toDate(),
    body('transactionId').optional().isString(),
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { itemId, quantity, cost, date, transactionId } = req.body;
    const organizationId = req.user!.organizationId;

    const newCogsEntry: CogsEntry = {
      id: `cogs_${Date.now()}`,
      organizationId,
      itemId,
      quantity,
      cost,
      date: new Date(date).toISOString(),
      transactionId,
      createdAt: new Date().toISOString(),
    };

    logger.info(`New COGS entry ${newCogsEntry.id} recorded for organization ${organizationId}`);
    res.status(201).json({ success: true, data: newCogsEntry });
  })
);

// Get low stock alerts
router.get(
  '/alerts/low-stock',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const lowStockItems = [
      {
        id: 'inv_2',
        name: 'Product B',
        sku: 'PB-002',
        quantityOnHand: 30,
        reorderPoint: 40,
        supplier: 'Supplier ABC',
      },
    ];

    // Send email alert if items are below reorder point
    if (lowStockItems.length > 0) {
      await sendEmail({
        to: process.env['INVENTORY_EMAIL'] || 'inventory@verigrade.com',
        subject: 'Low Stock Alert - Immediate Attention Required',
        template: 'billApprovalRequired',
        data: {
          items: lowStockItems,
          inventoryUrl: `${process.env['FRONTEND_URL']}/inventory`,
        },
      });
    }

    res.status(200).json({ success: true, data: lowStockItems });
  })
);

// Get inventory reports
router.get(
  '/reports',
  authenticate,
  asyncHandler(async (req: any, res: any) => {
    const reports = {
      summary: {
        totalItems: 150,
        totalValue: 45000,
        lowStockItems: 5,
        outOfStockItems: 2,
      },
      topSelling: [
        { itemId: 'inv_1', name: 'Product A', quantitySold: 250, revenue: 6250 },
        { itemId: 'inv_2', name: 'Product B', quantitySold: 180, revenue: 1890 },
      ],
      valuation: {
        totalCost: 45000,
        totalRetailValue: 67500,
        markupPercentage: 50,
      },
    };

    res.status(200).json({ success: true, data: reports });
  })
);

export default router;