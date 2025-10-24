import request from 'supertest';
import express from 'express';
import inventoryRoutes from '../../src/routes/inventoryRoutes';
import inventoryService from '../../src/services/inventoryService';

// Mock the inventory service
jest.mock('../../src/services/inventoryService');
jest.mock('../../src/middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { id: 'user-123', organizationId: 'org-123' };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/api/inventory', inventoryRoutes);

describe('Inventory Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/inventory/products', () => {
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
      };

      const mockProduct = {
        id: 'product-123',
        ...productData,
        isActive: true,
        organizationId: 'org-123',
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (inventoryService.createProduct as jest.Mock).mockResolvedValue(mockProduct);

      const response = await request(app)
        .post('/api/inventory/products')
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProduct);
      expect(inventoryService.createProduct).toHaveBeenCalledWith({
        name: productData.name,
        sku: productData.sku,
        description: productData.description,
        category: productData.category,
        unitPrice: productData.unitPrice,
        costPrice: productData.costPrice,
        stockQuantity: productData.stockQuantity,
        minStockLevel: productData.minStockLevel,
        maxStockLevel: productData.maxStockLevel,
        organizationId: 'org-123',
        createdBy: 'user-123',
      });
    });

    it('should return 400 for invalid product data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        sku: 'TEST-001',
        category: 'Electronics',
        unitPrice: -10, // Invalid: negative price
        costPrice: 80,
      };

      const response = await request(app)
        .post('/api/inventory/products')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle service errors', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        category: 'Electronics',
        unitPrice: 100,
        costPrice: 80,
      };

      (inventoryService.createProduct as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/inventory/products')
        .send(productData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to create product');
    });
  });

  describe('GET /api/inventory/products', () => {
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

      (inventoryService.getProducts as jest.Mock).mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/api/inventory/products?category=Electronics&isActive=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProducts);
      expect(inventoryService.getProducts).toHaveBeenCalledWith('org-123', {
        category: 'Electronics',
        isActive: true,
      });
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

      (inventoryService.getProducts as jest.Mock).mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/api/inventory/products?lowStock=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProducts);
      expect(inventoryService.getProducts).toHaveBeenCalledWith('org-123', {
        lowStock: true,
      });
    });
  });

  describe('GET /api/inventory/products/:id', () => {
    it('should return product by ID', async () => {
      const mockProduct = {
        id: 'product-123',
        name: 'Test Product',
        sku: 'TEST-001',
        category: 'Electronics',
        stockQuantity: 10,
        isActive: true,
      };

      (inventoryService.getProduct as jest.Mock).mockResolvedValue(mockProduct);

      const response = await request(app)
        .get('/api/inventory/products/product-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProduct);
      expect(inventoryService.getProduct).toHaveBeenCalledWith('product-123', 'org-123');
    });

    it('should return 404 for non-existent product', async () => {
      (inventoryService.getProduct as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/inventory/products/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Product not found');
    });
  });

  describe('PUT /api/inventory/products/:id', () => {
    it('should update product successfully', async () => {
      const updateData = {
        name: 'Updated Product',
        unitPrice: 120,
      };

      const mockUpdatedProduct = {
        id: 'product-123',
        name: 'Updated Product',
        sku: 'TEST-001',
        unitPrice: 120,
        costPrice: 80,
        stockQuantity: 10,
        isActive: true,
      };

      (inventoryService.updateProduct as jest.Mock).mockResolvedValue(mockUpdatedProduct);

      const response = await request(app)
        .put('/api/inventory/products/product-123')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUpdatedProduct);
      expect(inventoryService.updateProduct).toHaveBeenCalledWith(
        'product-123',
        updateData,
        'org-123',
        'user-123'
      );
    });
  });

  describe('DELETE /api/inventory/products/:id', () => {
    it('should delete product successfully', async () => {
      (inventoryService.deleteProduct as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/inventory/products/product-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product deleted successfully');
      expect(inventoryService.deleteProduct).toHaveBeenCalledWith('product-123', 'org-123');
    });
  });

  describe('POST /api/inventory/movements', () => {
    it('should record inventory movement successfully', async () => {
      const movementData = {
        productId: 'product-123',
        movementType: 'IN',
        quantity: 10,
        unitCost: 50,
        referenceType: 'PURCHASE',
        notes: 'Stock received',
      };

      const mockMovement = {
        id: 'movement-123',
        ...movementData,
        organizationId: 'org-123',
        userId: 'user-123',
        createdAt: new Date(),
      };

      (inventoryService.recordMovement as jest.Mock).mockResolvedValue(mockMovement);

      const response = await request(app)
        .post('/api/inventory/movements')
        .send(movementData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockMovement);
      expect(inventoryService.recordMovement).toHaveBeenCalledWith({
        productId: movementData.productId,
        movementType: movementData.movementType,
        quantity: parseInt(movementData.quantity.toString()),
        unitCost: parseFloat(movementData.unitCost.toString()),
        referenceType: movementData.referenceType,
        notes: movementData.notes,
        organizationId: 'org-123',
        userId: 'user-123',
      });
    });

    it('should return 400 for invalid movement data', async () => {
      const invalidData = {
        productId: 'invalid-uuid',
        movementType: 'INVALID',
        quantity: -5,
        unitCost: -10,
        referenceType: 'INVALID',
      };

      const response = await request(app)
        .post('/api/inventory/movements')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/inventory/products/low-stock', () => {
    it('should return low stock products', async () => {
      const mockLowStockProducts = [
        {
          id: 'product-1',
          name: 'Low Stock Product',
          sku: 'SKU-001',
          stockQuantity: 2,
          minStockLevel: 5,
        },
      ];

      (inventoryService.getLowStockProducts as jest.Mock).mockResolvedValue(mockLowStockProducts);

      const response = await request(app)
        .get('/api/inventory/products/low-stock')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockLowStockProducts);
      expect(inventoryService.getLowStockProducts).toHaveBeenCalledWith('org-123');
    });
  });

  describe('GET /api/inventory/stats', () => {
    it('should return inventory statistics', async () => {
      const mockStats = {
        totalProducts: 10,
        totalValue: 5000,
        lowStockCount: 3,
        outOfStockCount: 1,
        totalMovements: 50,
        byCategory: [
          { category: 'Electronics', count: 5, value: 3000 },
          { category: 'Clothing', count: 5, value: 2000 },
        ],
      };

      (inventoryService.getInventoryStats as jest.Mock).mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/inventory/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockStats);
      expect(inventoryService.getInventoryStats).toHaveBeenCalledWith('org-123');
    });
  });
});

