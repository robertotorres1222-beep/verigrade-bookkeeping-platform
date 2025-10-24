import { prisma } from '../src/config/database';

// Global test setup
beforeAll(async () => {
  // Setup test database connection
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup test database
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up test data before each test
  await prisma.inventoryMovement.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.timesheet.deleteMany();
  await prisma.project.deleteMany();
  await prisma.uploadedFile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
});

// Mock external services
jest.mock('../src/services/s3Service', () => ({
  S3Service: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn().mockResolvedValue({
      key: 'test-key',
      url: 'https://test-url.com',
      etag: 'test-etag',
      size: 1000,
      contentType: 'image/jpeg',
    }),
    getFile: jest.fn().mockResolvedValue(Buffer.from('test')),
    deleteFile: jest.fn().mockResolvedValue(undefined),
    generatePresignedUrl: jest.fn().mockResolvedValue('https://presigned-url.com'),
  })),
}));

jest.mock('../src/services/ocrService', () => ({
  default: {
    extractText: jest.fn().mockResolvedValue({
      text: 'Test OCR text',
      confidence: 0.95,
      boundingBoxes: [],
    }),
    extractTextFromPDF: jest.fn().mockResolvedValue({
      text: 'Test PDF text',
      confidence: 0.90,
      boundingBoxes: [],
    }),
  },
}));

// Mock authentication middleware
jest.mock('../src/middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = {
      id: 'test-user-123',
      organizationId: 'test-org-123',
      email: 'test@example.com',
    };
    next();
  },
}));

// Mock validation middleware
jest.mock('../src/middleware/validation', () => ({
  handleValidationErrors: (req: any, res: any, next: any) => {
    next();
  },
}));

// Global test utilities
global.testUtils = {
  createTestUser: async (overrides = {}) => {
    return await prisma.user.create({
      data: {
        id: 'test-user-' + Date.now(),
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedpassword',
        organizationId: 'test-org-123',
        ...overrides,
      },
    });
  },

  createTestOrganization: async (overrides = {}) => {
    return await prisma.organization.create({
      data: {
        id: 'test-org-' + Date.now(),
        name: 'Test Organization',
        type: 'BUSINESS',
        ...overrides,
      },
    });
  },

  createTestProduct: async (overrides = {}) => {
    return await prisma.product.create({
      data: {
        id: 'test-product-' + Date.now(),
        name: 'Test Product',
        sku: 'TEST-001',
        category: 'Electronics',
        unitPrice: 100,
        costPrice: 80,
        stockQuantity: 10,
        minStockLevel: 5,
        maxStockLevel: 100,
        isActive: true,
        organizationId: 'test-org-123',
        createdBy: 'test-user-123',
        updatedBy: 'test-user-123',
        ...overrides,
      },
    });
  },

  createTestProject: async (overrides = {}) => {
    return await prisma.project.create({
      data: {
        id: 'test-project-' + Date.now(),
        name: 'Test Project',
        description: 'Test project description',
        status: 'ACTIVE',
        organizationId: 'test-org-123',
        createdBy: 'test-user-123',
        updatedBy: 'test-user-123',
        ...overrides,
      },
    });
  },

  createTestTimeEntry: async (overrides = {}) => {
    return await prisma.timeEntry.create({
      data: {
        id: 'test-time-entry-' + Date.now(),
        organizationId: 'test-org-123',
        userId: 'test-user-123',
        description: 'Test time entry',
        startTime: new Date(),
        durationMinutes: 60,
        isBillable: true,
        status: 'DRAFT',
        ...overrides,
      },
    });
  },
};

// Extend Jest matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid UUID`,
      pass,
    };
  },

  toBeValidDate(received: string | Date) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime());
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid date`,
      pass,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidDate(): R;
    }
  }
}

