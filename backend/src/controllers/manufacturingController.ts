import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createBOMSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  version: z.string().default('1.0'),
  isActive: z.boolean().default(true)
});

const createBOMItemSchema = z.object({
  bomId: z.string().min(1, 'BOM is required'),
  componentId: z.string().min(1, 'Component is required'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  cost: z.number().min(0, 'Cost must be positive'),
  isRequired: z.boolean().default(true),
  notes: z.string().optional()
});

const createProductionOrderSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  bomId: z.string().min(1, 'BOM is required'),
  quantity: z.number().min(1, 'Quantity must be positive'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  startDate: z.string().min(1, 'Start date is required'),
  dueDate: z.string().optional(),
  notes: z.string().optional()
});

const updateProductionOrderSchema = z.object({
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  actualStartDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  completedQuantity: z.number().min(0).optional(),
  notes: z.string().optional()
});

// Create BOM (Bill of Materials)
export const createBOM = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const validatedData = createBOMSchema.parse(req.body);

    const bom = await prisma.billOfMaterials.create({
      data: {
        organizationId,
        productId: validatedData.productId,
        name: validatedData.name,
        description: validatedData.description,
        version: validatedData.version,
        isActive: validatedData.isActive
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        items: {
          include: {
            component: {
              select: {
                id: true,
                name: true,
                sku: true,
                cost: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: { bom }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Create BOM error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create BOM'
    });
  }
};

// Add BOM item
export const addBOMItem = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const validatedData = createBOMItemSchema.parse(req.body);

    // Verify BOM belongs to organization
    const bom = await prisma.billOfMaterials.findFirst({
      where: {
        id: validatedData.bomId,
        organizationId
      }
    });

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    const bomItem = await prisma.bomItem.create({
      data: {
        bomId: validatedData.bomId,
        componentId: validatedData.componentId,
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        cost: validatedData.cost,
        isRequired: validatedData.isRequired,
        notes: validatedData.notes
      },
      include: {
        component: {
          select: {
            id: true,
            name: true,
            sku: true,
            cost: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: { bomItem }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Add BOM item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add BOM item'
    });
  }
};

// Get BOMs
export const getBOMs = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { productId, page = 1, limit = 10, search } = req.query;

    const where: any = {
      organizationId
    };

    if (productId) {
      where.productId = productId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const boms = await prisma.billOfMaterials.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        items: {
          include: {
            component: {
              select: {
                id: true,
                name: true,
                sku: true,
                cost: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.billOfMaterials.count({ where });

    res.json({
      success: true,
      data: {
        boms,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get BOMs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch BOMs'
    });
  }
};

// Create production order
export const createProductionOrder = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const validatedData = createProductionOrderSchema.parse(req.body);

    // Calculate total cost from BOM
    const bom = await prisma.billOfMaterials.findFirst({
      where: {
        id: validatedData.bomId,
        organizationId
      },
      include: {
        items: {
          include: {
            component: {
              select: {
                cost: true
              }
            }
          }
        }
      }
    });

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    const totalCost = bom.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.cost));
    }, 0);

    const productionOrder = await prisma.productionOrder.create({
      data: {
        organizationId,
        productId: validatedData.productId,
        bomId: validatedData.bomId,
        quantity: validatedData.quantity,
        priority: validatedData.priority,
        startDate: new Date(validatedData.startDate),
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        estimatedCost: totalCost * validatedData.quantity,
        status: 'PLANNED',
        notes: validatedData.notes
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        bom: {
          select: {
            id: true,
            name: true,
            version: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: { productionOrder }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Create production order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create production order'
    });
  }
};

// Update production order
export const updateProductionOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user!;
    const validatedData = updateProductionOrderSchema.parse(req.body);

    // Check if production order exists
    const existingOrder = await prisma.productionOrder.findFirst({
      where: { id, organizationId }
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Production order not found'
      });
    }

    const updateData: any = {};
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.actualStartDate) updateData.actualStartDate = new Date(validatedData.actualStartDate);
    if (validatedData.actualEndDate) updateData.actualEndDate = new Date(validatedData.actualEndDate);
    if (validatedData.completedQuantity !== undefined) updateData.completedQuantity = validatedData.completedQuantity;
    if (validatedData.notes) updateData.notes = validatedData.notes;

    const productionOrder = await prisma.productionOrder.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        bom: {
          select: {
            id: true,
            name: true,
            version: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: { productionOrder }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Update production order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update production order'
    });
  }
};

// Get production orders
export const getProductionOrders = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { status, page = 1, limit = 10, search } = req.query;

    const where: any = {
      organizationId
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { notes: { contains: search as string, mode: 'insensitive' } },
        { product: { name: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    const productionOrders = await prisma.productionOrder.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        bom: {
          select: {
            id: true,
            name: true,
            version: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.productionOrder.count({ where });

    res.json({
      success: true,
      data: {
        productionOrders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get production orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch production orders'
    });
  }
};

// Calculate production cost
export const calculateProductionCost = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { bomId, quantity = 1 } = req.query;

    const bom = await prisma.billOfMaterials.findFirst({
      where: {
        id: bomId as string,
        organizationId
      },
      include: {
        items: {
          include: {
            component: {
              select: {
                id: true,
                name: true,
                sku: true,
                cost: true
              }
            }
          }
        }
      }
    });

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    const costBreakdown = bom.items.map(item => ({
      componentId: item.componentId,
      componentName: item.component.name,
      componentSku: item.component.sku,
      quantity: Number(item.quantity),
      unitCost: Number(item.cost),
      totalCost: Number(item.quantity) * Number(item.cost),
      isRequired: item.isRequired
    }));

    const totalCost = costBreakdown.reduce((sum, item) => sum + item.totalCost, 0);
    const totalCostForQuantity = totalCost * Number(quantity);

    res.json({
      success: true,
      data: {
        bomId: bom.id,
        bomName: bom.name,
        quantity: Number(quantity),
        costBreakdown,
        totalCost,
        totalCostForQuantity
      }
    });
  } catch (error) {
    console.error('Calculate production cost error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate production cost'
    });
  }
};

// Get production dashboard
export const getProductionDashboard = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;

    const [
      totalOrders,
      activeOrders,
      completedOrders,
      totalBOMs,
      totalProducts
    ] = await Promise.all([
      prisma.productionOrder.count({ where: { organizationId } }),
      prisma.productionOrder.count({ where: { organizationId, status: 'IN_PROGRESS' } }),
      prisma.productionOrder.count({ where: { organizationId, status: 'COMPLETED' } }),
      prisma.billOfMaterials.count({ where: { organizationId, isActive: true } }),
      prisma.inventoryItem.count({ where: { organizationId, isActive: true } })
    ]);

    const recentOrders = await prisma.productionOrder.findMany({
      where: { organizationId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      success: true,
      data: {
        totalOrders,
        activeOrders,
        completedOrders,
        totalBOMs,
        totalProducts,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get production dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch production dashboard'
    });
  }
};

