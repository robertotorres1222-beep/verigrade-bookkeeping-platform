import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

test.describe('Load Testing', () => {
  test('should handle concurrent product creation', async ({ page }) => {
    const startTime = Date.now();
    const promises = [];

    // Create 50 products concurrently
    for (let i = 0; i < 50; i++) {
      const promise = page.request.post(`${BASE_URL}/api/inventory/products`, {
        data: {
          name: `Load Test Product ${i}`,
          sku: `LOAD-${i.toString().padStart(3, '0')}`,
          category: 'Electronics',
          unitPrice: 100 + i,
          costPrice: 80 + i,
          stockQuantity: 10,
        },
        headers: {
          'Authorization': 'Bearer mock-jwt-token',
          'Content-Type': 'application/json',
        },
      });
      promises.push(promise);
    }

    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // All requests should succeed
    for (const response of responses) {
      expect(response.status()).toBe(201);
    }

    // Should complete within 10 seconds
    expect(duration).toBeLessThan(10000);
  });

  test('should handle concurrent inventory movements', async ({ page }) => {
    // First create a product
    const productResponse = await page.request.post(`${BASE_URL}/api/inventory/products`, {
      data: {
        name: 'Load Test Product',
        sku: 'LOAD-TEST',
        category: 'Electronics',
        unitPrice: 100,
        costPrice: 80,
        stockQuantity: 100,
      },
      headers: {
        'Authorization': 'Bearer mock-jwt-token',
        'Content-Type': 'application/json',
      },
    });

    expect(productResponse.status()).toBe(201);
    const product = await productResponse.json();
    const productId = product.data.id;

    const startTime = Date.now();
    const promises = [];

    // Create 100 inventory movements concurrently
    for (let i = 0; i < 100; i++) {
      const promise = page.request.post(`${BASE_URL}/api/inventory/movements`, {
        data: {
          productId,
          movementType: i % 2 === 0 ? 'IN' : 'OUT',
          quantity: 1,
          unitCost: 80,
          referenceType: 'PURCHASE',
          notes: `Load test movement ${i}`,
        },
        headers: {
          'Authorization': 'Bearer mock-jwt-token',
          'Content-Type': 'application/json',
        },
      });
      promises.push(promise);
    }

    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // All requests should succeed
    for (const response of responses) {
      expect(response.status()).toBe(201);
    }

    // Should complete within 15 seconds
    expect(duration).toBeLessThan(15000);
  });

  test('should handle high-frequency API calls', async ({ page }) => {
    const startTime = Date.now();
    const promises = [];

    // Make 200 GET requests to stats endpoint
    for (let i = 0; i < 200; i++) {
      const promise = page.request.get(`${BASE_URL}/api/inventory/stats`, {
        headers: {
          'Authorization': 'Bearer mock-jwt-token',
        },
      });
      promises.push(promise);
    }

    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // All requests should succeed
    for (const response of responses) {
      expect(response.status()).toBe(200);
    }

    // Should complete within 5 seconds
    expect(duration).toBeLessThan(5000);
  });

  test('should handle mixed workload', async ({ page }) => {
    const startTime = Date.now();
    const promises = [];

    // Mix of different operations
    for (let i = 0; i < 20; i++) {
      // Create product
      promises.push(
        page.request.post(`${BASE_URL}/api/inventory/products`, {
          data: {
            name: `Mixed Workload Product ${i}`,
            sku: `MIXED-${i}`,
            category: 'Electronics',
            unitPrice: 100,
            costPrice: 80,
            stockQuantity: 10,
          },
          headers: {
            'Authorization': 'Bearer mock-jwt-token',
            'Content-Type': 'application/json',
          },
        })
      );

      // Get products
      promises.push(
        page.request.get(`${BASE_URL}/api/inventory/products`, {
          headers: {
            'Authorization': 'Bearer mock-jwt-token',
          },
        })
      );

      // Get stats
      promises.push(
        page.request.get(`${BASE_URL}/api/inventory/stats`, {
          headers: {
            'Authorization': 'Bearer mock-jwt-token',
          },
        })
      );
    }

    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Most requests should succeed (allow for some failures under load)
    const successCount = responses.filter(r => r.status() < 400).length;
    const successRate = successCount / responses.length;
    
    expect(successRate).toBeGreaterThan(0.9); // 90% success rate
    expect(duration).toBeLessThan(30000); // 30 seconds max
  });

  test('should handle database connection limits', async ({ page }) => {
    const startTime = Date.now();
    const promises = [];

    // Create many concurrent requests to test connection pooling
    for (let i = 0; i < 100; i++) {
      const promise = page.request.get(`${BASE_URL}/api/inventory/products`, {
        headers: {
          'Authorization': 'Bearer mock-jwt-token',
        },
      });
      promises.push(promise);
    }

    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // All requests should succeed
    for (const response of responses) {
      expect(response.status()).toBe(200);
    }

    // Should complete within 10 seconds
    expect(duration).toBeLessThan(10000);
  });

  test('should handle memory usage under load', async ({ page }) => {
    const startTime = Date.now();
    const promises = [];

    // Create large number of requests to test memory usage
    for (let i = 0; i < 500; i++) {
      const promise = page.request.get(`${BASE_URL}/api/inventory/stats`, {
        headers: {
          'Authorization': 'Bearer mock-jwt-token',
        },
      });
      promises.push(promise);
    }

    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // All requests should succeed
    for (const response of responses) {
      expect(response.status()).toBe(200);
    }

    // Should complete within 20 seconds
    expect(duration).toBeLessThan(20000);
  });
});

