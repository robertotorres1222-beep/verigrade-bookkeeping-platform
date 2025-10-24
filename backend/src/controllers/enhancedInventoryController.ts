import { Request, Response } from 'express';
import { EnhancedInventoryService } from '../services/enhancedInventoryService';
import { z } from 'zod';

const inventoryService = new EnhancedInventoryService();

// Validation schemas
const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  cost: z.number().min(0, 'Cost must be positive'),
  price: z.number().min(0, 'Price must be positive'),
  minStock: z.number().min(0, 'Min stock must be positive'),
  maxStock: z.number().min(0, 'Max stock must be positive'),
  reorderPoint: z.number().min(0, 'Reorder point must be positive'),
  trackingType: z.enum(['NONE', 'SERIAL', 'BATCH', 'BOTH']),
  valuationMethod: z.enum(['FIFO', 'LIFO', 'WEIGHTED_AVERAGE']),
  isActive: z.boolean().default(true)
});

const createLocationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  isDefault: z.boolean().default(false)
});

const createTransactionSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  locationId: z.string().min(1, 'Location is required'),
  type: z.enum(['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT']),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unitCost: z.number().min(0, 'Unit cost must be positive'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  serialNumbers: z.array(z.string()).optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional()
});

const transferInventorySchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  fromLocationId: z.string().min(1, 'From location is required'),
  toLocationId: z.string().min(1, 'To location is required'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  serialNumbers: z.array(z.string()).optional(),
  batchNumber: z.string().optional(),
  notes: z.string().optional()
});

// Create inventory item
export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const validatedData = createItemSchema.parse(req.body);

    const item = await inventoryService.createInventoryItem(organizationId, validatedData);

    res.status(201).json({
      success: true,
      data: { item }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Create inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inventory item'
    });
  }
};

// Create inventory location
export const createInventoryLocation = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const validatedData = createLocationSchema.parse(req.body);

    const location = await inventoryService.createInventoryLocation(organizationId, validatedData);

    res.status(201).json({
      success: true,
      data: { location }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Create inventory location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inventory location'
    });
  }
};

// Create inventory transaction
export const createInventoryTransaction = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const validatedData = createTransactionSchema.parse(req.body);

    const transaction = await inventoryService.createInventoryTransaction(organizationId, validatedData);

    res.status(201).json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Create inventory transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inventory transaction'
    });
  }
};

// Transfer inventory between locations
export const transferInventory = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const validatedData = transferInventorySchema.parse(req.body);

    await inventoryService.transferInventory(organizationId, validatedData);

    res.json({
      success: true,
      message: 'Inventory transferred successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Transfer inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to transfer inventory'
    });
  }
};

// Get serial number tracking
export const getSerialNumberTracking = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { itemId } = req.query;

    const serialNumbers = await inventoryService.getSerialNumberTracking(
      organizationId,
      itemId as string
    );

    res.json({
      success: true,
      data: { serialNumbers }
    });
  } catch (error) {
    console.error('Get serial number tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch serial number tracking'
    });
  }
};

// Get batch tracking
export const getBatchTracking = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { itemId } = req.query;

    const batches = await inventoryService.getBatchTracking(
      organizationId,
      itemId as string
    );

    res.json({
      success: true,
      data: { batches }
    });
  } catch (error) {
    console.error('Get batch tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch tracking'
    });
  }
};

// Get multi-location stock levels
export const getMultiLocationStock = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { itemId } = req.query;

    const stockLevels = await inventoryService.getMultiLocationStock(
      organizationId,
      itemId as string
    );

    res.json({
      success: true,
      data: { stockLevels }
    });
  } catch (error) {
    console.error('Get multi-location stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch multi-location stock'
    });
  }
};

// Get inventory valuation
export const getInventoryValuation = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { method = 'WEIGHTED_AVERAGE' } = req.query;

    const valuation = await inventoryService.getInventoryValuation(
      organizationId,
      method as 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE'
    );

    res.json({
      success: true,
      data: { valuation }
    });
  } catch (error) {
    console.error('Get inventory valuation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory valuation'
    });
  }
};

// Get inventory alerts
export const getInventoryAlerts = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { isActive } = req.query;

    const alerts = await inventoryService.getInventoryAlerts(
      organizationId,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined
    );

    res.json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    console.error('Get inventory alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory alerts'
    });
  }
};

// Get inventory reports
export const getInventoryReports = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { reportType = 'STOCK_LEVELS' } = req.query;

    const report = await inventoryService.getInventoryReports(
      organizationId,
      reportType as 'STOCK_LEVELS' | 'MOVEMENTS' | 'VALUATION' | 'ALERTS'
    );

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    console.error('Get inventory reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory reports'
    });
  }
};