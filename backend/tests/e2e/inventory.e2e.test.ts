import request from 'supertest';
import { app } from '../../src/index';
import { prisma } from '../../src/config/database';

describe('Inventory E2E Tests', () => {
  let authToken: string;
  let organizationId: string;
  let userId: string;

  beforeAll(async () => {
    // Setup test data
    const testUser = await prisma.user.create({
      data: {
        id: 'test-user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedpassword',
        organizationId: 'test-org-123',
      },
    });

    const testOrg = await prisma.organization.create({
      data: {
        id: 'test-org-123',
        name: 'Test Organization',
        type: 'BUSINESS',
      },
    });

    userId = testUser.id;
    organizationId = testOrg.id;
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.product.deleteMany({
      where: { organizationId },
    });
    await prisma.inventoryMovement.deleteMany({
      where: { organizationId },
    });
    await prisma.user.deleteMany({
      where: { id: userId },
    });
    await prisma.organization.deleteMany({
      where: { id: organizationId },
    });
  });

  describe('Product Management Flow', () => {
    let productId: string;

    it('should create a new product', async () => {
      const productData = {
        name: 'E2E Test Product',
        sku: 'E2E-001',
        description: 'End-to-end test product',
        category: 'Electronics',
        unitPrice: 100,
        costPrice: 80,
        stockQuantity: 10,
        minStockLevel: 5,
        maxStockLevel: 100,
      };

      const response = await request(app)
        .post('/api/inventory/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(productData.name);
      expect(response.body.data.sku).toBe(productData.sku);
      expect(response.body.data.stockQuantity).toBe(productData.stockQuantity);

      productId = response.body.data.id;
    });

    it('should retrieve the created product', async () => {
      const response = await request(app)
        .get(`/api/inventory/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(productId);
      expect(response.body.data.name).toBe('E2E Test Product');
    });

    it('should update the product', async () => {
      const updateData = {
        name: 'Updated E2E Product',
        unitPrice: 120,
        stockQuantity: 15,
      };

      const response = await request(app)
        .put(`/api/inventory/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.unitPrice).toBe(updateData.unitPrice);
      expect(response.body.data.stockQuantity).toBe(updateData.stockQuantity);
    });

    it('should record inventory movement', async () => {
      const movementData = {
        productId,
        movementType: 'IN',
        quantity: 5,
        unitCost: 75,
        referenceType: 'PURCHASE',
        notes: 'E2E test stock addition',
      };

      const response = await request(app)
        .post('/api/inventory/movements')
        .set('Authorization', `Bearer ${authToken}`)
        .send(movementData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.productId).toBe(productId);
      expect(response.body.data.quantity).toBe(movementData.quantity);
    });

    it('should get product movements', async () => {
      const response = await request(app)
        .get(`/api/inventory/products/${productId}/movements`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get inventory statistics', async () => {
      const response = await request(app)
        .get('/api/inventory/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalProducts).toBeGreaterThan(0);
      expect(response.body.data.totalValue).toBeGreaterThan(0);
      expect(response.body.data.byCategory).toBeInstanceOf(Array);
    });

    it('should delete the product', async () => {
      const response = await request(app)
        .delete(`/api/inventory/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product deleted successfully');
    });
  });

  describe('Low Stock Management', () => {
    let lowStockProductId: string;

    it('should create a low stock product', async () => {
      const productData = {
        name: 'Low Stock Product',
        sku: 'LOW-001',
        category: 'Electronics',
        unitPrice: 50,
        costPrice: 40,
        stockQuantity: 2,
        minStockLevel: 5,
        maxStockLevel: 50,
      };

      const response = await request(app)
        .post('/api/inventory/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      lowStockProductId = response.body.data.id;
    });

    it('should identify low stock products', async () => {
      const response = await request(app)
        .get('/api/inventory/products/low-stock')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const lowStockProduct = response.body.data.find((p: any) => p.id === lowStockProductId);
      expect(lowStockProduct).toBeDefined();
      expect(lowStockProduct.stockQuantity).toBeLessThanOrEqual(lowStockProduct.minStockLevel);
    });

    it('should clean up low stock product', async () => {
      await request(app)
        .delete(`/api/inventory/products/${lowStockProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Purchase Order Management', () => {
    let purchaseOrderId: string;

    it('should create a purchase order', async () => {
      const purchaseOrderData = {
        supplierId: 'supplier-123',
        orderNumber: 'PO-E2E-001',
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'E2E test purchase order',
      };

      const response = await request(app)
        .post('/api/inventory/purchase-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(purchaseOrderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toBe(purchaseOrderData.orderNumber);
      expect(response.body.data.status).toBe('DRAFT');

      purchaseOrderId = response.body.data.id;
    });

    it('should add items to purchase order', async () => {
      // First create a product
      const productData = {
        name: 'PO Test Product',
        sku: 'PO-001',
        category: 'Electronics',
        unitPrice: 100,
        costPrice: 80,
        stockQuantity: 0,
      };

      const productResponse = await request(app)
        .post('/api/inventory/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      const productId = productResponse.body.data.id;

      // Add item to purchase order
      const itemData = {
        productId,
        quantity: 10,
        unitCost: 75,
      };

      const response = await request(app)
        .post(`/api/inventory/purchase-orders/${purchaseOrderId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Item added to purchase order');
    });

    it('should receive purchase order', async () => {
      const response = await request(app)
        .post(`/api/inventory/purchase-orders/${purchaseOrderId}/receive`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Purchase order received successfully');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/inventory/products/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Product not found');
    });

    it('should return 400 for invalid product data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        sku: 'INVALID',
        category: 'Electronics',
        unitPrice: -10, // Invalid: negative price
        costPrice: 80,
      };

      const response = await request(app)
        .post('/api/inventory/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
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
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    it('should handle bulk product creation efficiently', async () => {
      const startTime = Date.now();
      const products = [];

      // Create 10 products
      for (let i = 0; i < 10; i++) {
        const productData = {
          name: `Bulk Product ${i}`,
          sku: `BULK-${i.toString().padStart(3, '0')}`,
          category: 'Electronics',
          unitPrice: 100 + i,
          costPrice: 80 + i,
          stockQuantity: 10,
        };

        const response = await request(app)
          .post('/api/inventory/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send(productData)
          .expect(201);

        products.push(response.body.data.id);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);

      // Cleanup
      for (const productId of products) {
        await request(app)
          .delete(`/api/inventory/products/${productId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      }
    });

    it('should handle large inventory statistics efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .get('/api/inventory/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000);
      expect(response.body.success).toBe(true);
    });
  });
});

