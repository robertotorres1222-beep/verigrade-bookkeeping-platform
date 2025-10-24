import { InventoryService } from '../../src/services/inventoryService';
import { prisma } from '../../src/config/database';

// Mock Prisma
jest.mock('../../src/config/database', () => ({
  prisma: {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    inventoryMovement: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    purchaseOrder: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    purchaseOrderItem: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('InventoryService', () => {
  let inventoryService: InventoryService;

  beforeEach(() => {
    inventoryService = new InventoryService();
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a new product successfully', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'Test description',
        category: 'Electronics',
        unitPrice: 100,
        costPrice: 80,
        stockQuantity: 10,
        minStockLevel: 5,
        maxStockLevel: 100,
        organizationId: 'org-123',
        createdBy: 'user-123',
      };

      const mockProduct = {
        id: 'product-123',
        ...productData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

      const result = await inventoryService.createProduct(productData);

      expect(prisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: productData.name,
          sku: productData.sku,
          category: productData.category,
          unitPrice: productData.unitPrice,
          costPrice: productData.costPrice,
        }),
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw error when product creation fails', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        category: 'Electronics',
        unitPrice: 100,
        costPrice: 80,
        organizationId: 'org-123',
        createdBy: 'user-123',
      };

      (prisma.product.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(inventoryService.createProduct(productData)).rejects.toThrow('Failed to create product');
    });
  });

  describe('getProducts', () => {
    it('should return products with filters', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Product 1',
          sku: 'SKU-001',
          category: 'Electronics',
          stockQuantity: 10,
          isActive: true,
        },
        {
          id: 'product-2',
          name: 'Product 2',
          sku: 'SKU-002',
          category: 'Clothing',
          stockQuantity: 5,
          isActive: true,
        },
      ];

      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await inventoryService.getProducts('org-123', {
        category: 'Electronics',
        isActive: true,
      });

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-123',
          category: 'Electronics',
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockProducts);
    });

    it('should handle low stock filter', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Low Stock Product',
          sku: 'SKU-001',
          stockQuantity: 2,
          minStockLevel: 5,
        },
      ];

      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await inventoryService.getProducts('org-123', {
        lowStock: true,
      });

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-123',
          stockQuantity: { lte: expect.any(Object) },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('recordMovement', () => {
    it('should record inventory movement and update stock', async () => {
      const movementData = {
        productId: 'product-123',
        movementType: 'IN' as const,
        quantity: 10,
        unitCost: 50,
        referenceType: 'PURCHASE' as const,
        organizationId: 'org-123',
        userId: 'user-123',
      };

      const mockMovement = {
        id: 'movement-123',
        ...movementData,
        createdAt: new Date(),
      };

      const mockProduct = {
        id: 'product-123',
        stockQuantity: 20,
      };

      (prisma.inventoryMovement.create as jest.Mock).mockResolvedValue(mockMovement);
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.product.update as jest.Mock).mockResolvedValue({});

      const result = await inventoryService.recordMovement(movementData);

      expect(prisma.inventoryMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productId: movementData.productId,
          movementType: movementData.movementType,
          quantity: movementData.quantity,
        }),
      });

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: movementData.productId },
        data: { stockQuantity: 30 }, // 20 + 10
      });

      expect(result).toEqual(mockMovement);
    });

    it('should handle OUT movement correctly', async () => {
      const movementData = {
        productId: 'product-123',
        movementType: 'OUT' as const,
        quantity: 5,
        unitCost: 50,
        referenceType: 'SALE' as const,
        organizationId: 'org-123',
        userId: 'user-123',
      };

      const mockProduct = {
        id: 'product-123',
        stockQuantity: 20,
      };

      (prisma.inventoryMovement.create as jest.Mock).mockResolvedValue({});
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.product.update as jest.Mock).mockResolvedValue({});

      await inventoryService.recordMovement(movementData);

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: movementData.productId },
        data: { stockQuantity: 15 }, // 20 - 5
      });
    });
  });

  describe('getLowStockProducts', () => {
    it('should return products with stock below minimum level', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Low Stock Product',
          sku: 'SKU-001',
          stockQuantity: 2,
          minStockLevel: 5,
        },
      ];

      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await inventoryService.getLowStockProducts('org-123');

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-123',
          isActive: true,
          stockQuantity: { lte: expect.any(Object) },
        },
        orderBy: { stockQuantity: 'asc' },
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getInventoryStats', () => {
    it('should return inventory statistics', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          stockQuantity: 10,
          costPrice: 50,
          category: 'Electronics',
        },
        {
          id: 'product-2',
          stockQuantity: 5,
          costPrice: 30,
          category: 'Clothing',
        },
      ];

      const mockStats = {
        totalProducts: 2,
        totalValue: 650, // (10 * 50) + (5 * 30)
        lowStockCount: 1,
        outOfStockCount: 0,
        totalMovements: 10,
        byCategory: [
          { category: 'Electronics', count: 1, value: 500 },
          { category: 'Clothing', count: 1, value: 150 },
        ],
      };

      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (prisma.product.count as jest.Mock)
        .mockResolvedValueOnce(2) // totalProducts
        .mockResolvedValueOnce(10) // totalMovements
        .mockResolvedValueOnce(1) // lowStockCount
        .mockResolvedValueOnce(0); // outOfStockCount

      const result = await inventoryService.getInventoryStats('org-123');

      expect(result.totalProducts).toBe(2);
      expect(result.totalValue).toBe(650);
      expect(result.byCategory).toHaveLength(2);
    });
  });
});

