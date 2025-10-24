import { Request, Response } from 'express';
import barcodeService from '../services/barcodeService';
import { prisma } from '../lib/prisma';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * Scan barcode from uploaded image
 */
export const scanBarcode = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }

    const result = await barcodeService.scanBarcode(req.file.buffer);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'No barcode found in image',
      });
    }

    // Look up product information
    const productInfo = await barcodeService.lookupProduct(result.text);

    res.json({
      success: true,
      barcode: result,
      product: productInfo,
    });
  } catch (error) {
    console.error('Error scanning barcode:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to scan barcode',
    });
  }
};

/**
 * Look up product by barcode
 */
export const lookupProduct = async (req: Request, res: Response) => {
  try {
    const { barcode } = req.params;
    
    if (!barcodeService.validateBarcode(barcode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid barcode format',
      });
    }

    const product = await barcodeService.lookupProduct(barcode);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error looking up product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to lookup product',
    });
  }
};

/**
 * Generate barcode image
 */
export const generateBarcode = async (req: Request, res: Response) => {
  try {
    const { text, format = 'CODE128' } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required',
      });
    }

    const barcodeBuffer = await barcodeService.generateBarcode(text, format);
    
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': barcodeBuffer.length,
    });
    
    res.send(barcodeBuffer);
  } catch (error) {
    console.error('Error generating barcode:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate barcode',
    });
  }
};

/**
 * Get supported barcode formats
 */
export const getSupportedFormats = async (req: Request, res: Response) => {
  try {
    const formats = barcodeService.getSupportedFormats();
    const formatInfo = formats.map(format => ({
      format,
      ...barcodeService.getFormatInfo(format),
    }));

    res.json({
      success: true,
      formats: formatInfo,
    });
  } catch (error) {
    console.error('Error getting supported formats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get supported formats',
    });
  }
};

/**
 * Validate barcode
 */
export const validateBarcode = async (req: Request, res: Response) => {
  try {
    const { barcode } = req.body;
    
    if (!barcode) {
      return res.status(400).json({
        success: false,
        error: 'Barcode is required',
      });
    }

    const isValid = barcodeService.validateBarcode(barcode);
    
    res.json({
      success: true,
      valid: isValid,
      barcode,
    });
  } catch (error) {
    console.error('Error validating barcode:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate barcode',
    });
  }
};

/**
 * Batch scan multiple images
 */
export const batchScan = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided',
      });
    }

    const images = req.files.map((file: any) => file.buffer);
    const results = await barcodeService.batchScan(images);
    
    res.json({
      success: true,
      results,
      totalScanned: req.files.length,
      totalFound: results.length,
    });
  } catch (error) {
    console.error('Error batch scanning:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to batch scan images',
    });
  }
};

/**
 * Add product to inventory
 */
export const addProductToInventory = async (req: Request, res: Response) => {
  try {
    const {
      barcode,
      name,
      sku,
      price,
      category,
      description,
      quantity,
      location,
    } = req.body;

    if (!barcode || !name || !sku || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: barcode, name, sku, price',
      });
    }

    // Check if product already exists
    const existingProduct = await prisma.inventoryItem.findFirst({
      where: {
        OR: [
          { barcode },
          { sku },
        ],
      },
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        error: 'Product with this barcode or SKU already exists',
        product: existingProduct,
      });
    }

    // Create new inventory item
    const product = await prisma.inventoryItem.create({
      data: {
        barcode,
        name,
        sku,
        price,
        category,
        description,
        quantity: quantity || 0,
        location,
        organizationId: req.user!.organizationId!,
        createdBy: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error adding product to inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add product to inventory',
    });
  }
};

/**
 * Update inventory quantity
 */
export const updateInventoryQuantity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, operation = 'set' } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Quantity is required',
      });
    }

    const product = await prisma.inventoryItem.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId!,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    let newQuantity = product.quantity;
    
    switch (operation) {
      case 'add':
        newQuantity += quantity;
        break;
      case 'subtract':
        newQuantity -= quantity;
        break;
      case 'set':
      default:
        newQuantity = quantity;
        break;
    }

    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity cannot be negative',
      });
    }

    const updatedProduct = await prisma.inventoryItem.update({
      where: { id },
      data: { quantity: newQuantity },
    });

    // Log the inventory change
    await prisma.inventoryTransaction.create({
      data: {
        itemId: id,
        type: operation,
        quantity: quantity,
        previousQuantity: product.quantity,
        newQuantity: newQuantity,
        userId: req.user!.id,
        organizationId: req.user!.organizationId!,
        notes: `Inventory ${operation} operation`,
      },
    });

    res.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update inventory quantity',
    });
  }
};

/**
 * Get inventory items
 */
export const getInventoryItems = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, category, location } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      organizationId: req.user!.organizationId!,
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
        { barcode: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (location) {
      where.location = location;
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    res.json({
      success: true,
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error getting inventory items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inventory items',
    });
  }
};

/**
 * Get inventory item by barcode
 */
export const getInventoryItemByBarcode = async (req: Request, res: Response) => {
  try {
    const { barcode } = req.params;

    const item = await prisma.inventoryItem.findFirst({
      where: {
        barcode,
        organizationId: req.user!.organizationId!,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found',
      });
    }

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error('Error getting inventory item by barcode:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inventory item',
    });
  }
};

/**
 * Get inventory transactions
 */
export const getInventoryTransactions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, itemId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      organizationId: req.user!.organizationId!,
    };

    if (itemId) {
      where.itemId = itemId;
    }

    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          item: {
            select: {
              name: true,
              sku: true,
              barcode: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.inventoryTransaction.count({ where }),
    ]);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error getting inventory transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inventory transactions',
    });
  }
};

export { upload };

