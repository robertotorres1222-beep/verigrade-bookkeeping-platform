import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VeriGrade Bookkeeping Platform API',
      version: '1.0.0',
      description: 'Comprehensive API for professional bookkeeping and financial management',
      contact: {
        name: 'VeriGrade Support',
        email: 'support@verigrade.com',
        url: 'https://verigrade.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://api.verigrade.com',
        description: 'Production server'
      },
      {
        url: 'https://staging-api.verigrade.com',
        description: 'Staging server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from authentication endpoint'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for programmatic access'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'An error occurred'
            },
            error: {
              type: 'string',
              example: 'Detailed error message'
            },
            code: {
              type: 'string',
              example: 'VALIDATION_ERROR'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1
            },
            limit: {
              type: 'integer',
              example: 50
            },
            total: {
              type: 'integer',
              example: 150
            },
            totalPages: {
              type: 'integer',
              example: 3
            },
            hasNext: {
              type: 'boolean',
              example: true
            },
            hasPrev: {
              type: 'boolean',
              example: false
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'user-123'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            role: {
              type: 'string',
              enum: ['admin', 'user', 'viewer'],
              example: 'user'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Invoice: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'invoice-123'
            },
            invoiceNumber: {
              type: 'string',
              example: 'INV-001'
            },
            clientId: {
              type: 'string',
              example: 'client-123'
            },
            status: {
              type: 'string',
              enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
              example: 'sent'
            },
            totalAmount: {
              type: 'number',
              format: 'decimal',
              example: 1000.00
            },
            dueDate: {
              type: 'string',
              format: 'date'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Client: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'client-123'
            },
            name: {
              type: 'string',
              example: 'Acme Corporation'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'contact@acme.com'
            },
            phone: {
              type: 'string',
              example: '+1-555-0123'
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' },
                country: { type: 'string' }
              }
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Expense: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'expense-123'
            },
            description: {
              type: 'string',
              example: 'Office supplies'
            },
            amount: {
              type: 'number',
              format: 'decimal',
              example: 150.00
            },
            category: {
              type: 'string',
              example: 'Office Expenses'
            },
            date: {
              type: 'string',
              format: 'date'
            },
            vendor: {
              type: 'string',
              example: 'Office Depot'
            },
            isReimbursable: {
              type: 'boolean',
              example: true
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected', 'paid'],
              example: 'approved'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        BankAccount: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'account-123'
            },
            accountName: {
              type: 'string',
              example: 'Business Checking'
            },
            accountNumber: {
              type: 'string',
              example: '****1234'
            },
            bankName: {
              type: 'string',
              example: 'Chase Bank'
            },
            accountType: {
              type: 'string',
              enum: ['checking', 'savings', 'credit', 'loan', 'investment'],
              example: 'checking'
            },
            balance: {
              type: 'number',
              format: 'decimal',
              example: 5000.00
            },
            currency: {
              type: 'string',
              example: 'USD'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            lastSyncAt: {
              type: 'string',
              format: 'date-time'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Unauthorized access',
                error: 'Invalid or expired token'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Access denied',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Access denied',
                error: 'Insufficient permissions'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Resource not found',
                error: 'The requested resource does not exist'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Validation failed',
                error: 'Invalid input data',
                code: 'VALIDATION_ERROR'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Internal server error',
                error: 'An unexpected error occurred'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Clients',
        description: 'Client management and operations'
      },
      {
        name: 'Invoices',
        description: 'Invoice creation, management, and processing'
      },
      {
        name: 'Expenses',
        description: 'Expense tracking and management'
      },
      {
        name: 'Banking',
        description: 'Bank account management and transactions'
      },
      {
        name: 'Reports',
        description: 'Financial reports and analytics'
      },
      {
        name: 'Documents',
        description: 'Document management and OCR'
      },
      {
        name: 'Integrations',
        description: 'Third-party integrations and webhooks'
      },
      {
        name: 'Search',
        description: 'Advanced search and filtering'
      },
      {
        name: 'Bulk Operations',
        description: 'Bulk data operations'
      },
      {
        name: 'Security',
        description: 'Security and compliance features'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/swagger/paths/*.ts'
  ]
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'VeriGrade API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true
    }
  }));

  // Serve OpenAPI spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default specs;







