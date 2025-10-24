import { Request, Response } from 'express';

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  parameters?: {
    path?: Record<string, string>;
    query?: Record<string, string>;
    body?: Record<string, any>;
  };
  responses: {
    [statusCode: number]: {
      description: string;
      schema?: any;
    };
  };
  authentication?: boolean;
  rateLimit?: string;
}

export const generateApiDocs = (endpoints: ApiEndpoint[]) => {
  return {
    openapi: '3.0.0',
    info: {
      title: 'VeriGrade API',
      description: 'Comprehensive bookkeeping and practice management API',
      version: '1.0.0',
      contact: {
        name: 'VeriGrade Support',
        email: 'support@verigrade.com',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            isActive: { type: 'boolean' },
            emailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Organization: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            industry: { type: 'string' },
            size: { type: 'string' },
            currency: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                details: { type: 'object' },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                pages: { type: 'number' },
              },
            },
          },
        },
      },
    },
    paths: endpoints.reduce((paths, endpoint) => {
      const pathKey = endpoint.path.replace(/:\w+/g, '{id}');
      if (!paths[pathKey]) {
        paths[pathKey] = {};
      }
      
      paths[pathKey][endpoint.method.toLowerCase()] = {
        summary: endpoint.description,
        security: endpoint.authentication ? [{ bearerAuth: [] }] : [],
        parameters: [
          ...(endpoint.parameters?.path ? Object.entries(endpoint.parameters.path).map(([name, description]) => ({
            name,
            in: 'path',
            required: true,
            description,
            schema: { type: 'string' },
          })) : []),
          ...(endpoint.parameters?.query ? Object.entries(endpoint.parameters.query).map(([name, description]) => ({
            name,
            in: 'query',
            required: false,
            description,
            schema: { type: 'string' },
          })) : []),
        ],
        requestBody: endpoint.parameters?.body ? {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: endpoint.parameters.body,
              },
            },
          },
        } : undefined,
        responses: Object.entries(endpoint.responses).reduce((responses, [statusCode, response]) => {
          responses[statusCode] = {
            description: response.description,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponse',
                },
              },
            },
          };
          return responses;
        }, {} as any),
      };
      
      return paths;
    }, {} as any),
  };
};

export const apiEndpoints: ApiEndpoint[] = [
  // Authentication endpoints
  {
    method: 'POST',
    path: '/api/auth/register',
    description: 'Register a new user',
    parameters: {
      body: {
        email: 'User email address',
        password: 'User password (min 8 characters)',
        firstName: 'User first name',
        lastName: 'User last name',
        company: 'Company name (optional)',
        phone: 'Phone number (optional)',
      },
    },
    responses: {
      201: { description: 'User registered successfully' },
      400: { description: 'Validation error' },
      409: { description: 'User already exists' },
    },
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticate user',
    parameters: {
      body: {
        email: 'User email address',
        password: 'User password',
      },
    },
    responses: {
      200: { description: 'Login successful' },
      401: { description: 'Invalid credentials' },
    },
  },
  {
    method: 'POST',
    path: '/api/auth/logout',
    description: 'Logout user',
    authentication: true,
    responses: {
      200: { description: 'Logout successful' },
      401: { description: 'Unauthorized' },
    },
  },
  {
    method: 'GET',
    path: '/api/auth/me',
    description: 'Get current user profile',
    authentication: true,
    responses: {
      200: { description: 'User profile retrieved' },
      401: { description: 'Unauthorized' },
    },
  },
  
  // Practice Management endpoints
  {
    method: 'POST',
    path: '/api/practice',
    description: 'Create a new practice',
    authentication: true,
    parameters: {
      body: {
        name: 'Practice name',
        description: 'Practice description (optional)',
        logo: 'Practice logo URL (optional)',
        brandColor: 'Brand color hex code (optional)',
        customDomain: 'Custom domain (optional)',
        emailSignature: 'Email signature (optional)',
      },
    },
    responses: {
      201: { description: 'Practice created successfully' },
      400: { description: 'Validation error' },
    },
  },
  {
    method: 'GET',
    path: '/api/practice/:practiceId/dashboard',
    description: 'Get practice dashboard data',
    authentication: true,
    parameters: {
      path: {
        practiceId: 'Practice ID',
      },
    },
    responses: {
      200: { description: 'Dashboard data retrieved' },
      404: { description: 'Practice not found' },
    },
  },
  
  // AI Assistant endpoints
  {
    method: 'GET',
    path: '/api/prompts',
    description: 'Get all available prompts',
    parameters: {
      query: {
        category: 'Filter by category',
        search: 'Search term',
      },
    },
    responses: {
      200: { description: 'Prompts retrieved successfully' },
    },
  },
  {
    method: 'GET',
    path: '/api/prompts/:id',
    description: 'Get specific prompt with auto-populated data',
    parameters: {
      path: {
        id: 'Prompt ID',
      },
    },
    responses: {
      200: { description: 'Prompt retrieved successfully' },
      404: { description: 'Prompt not found' },
    },
  },
  {
    method: 'POST',
    path: '/api/prompts/:id/execute',
    description: 'Execute a prompt with user data',
    authentication: true,
    parameters: {
      path: {
        id: 'Prompt ID',
      },
      body: {
        inputData: 'Input data object',
      },
    },
    responses: {
      200: { description: 'Prompt executed successfully' },
      400: { description: 'Invalid input data' },
      404: { description: 'Prompt not found' },
    },
  },
  
  // Task Management endpoints
  {
    method: 'POST',
    path: '/api/tasks',
    description: 'Create a new task',
    authentication: true,
    parameters: {
      body: {
        title: 'Task title',
        description: 'Task description (optional)',
        priority: 'Task priority (LOW, MEDIUM, HIGH, URGENT)',
        dueDate: 'Due date (ISO string)',
        assignedTo: 'Assigned user ID',
        clientId: 'Client ID (optional)',
        category: 'Task category (optional)',
        tags: 'Task tags array (optional)',
      },
    },
    responses: {
      201: { description: 'Task created successfully' },
      400: { description: 'Validation error' },
    },
  },
  {
    method: 'GET',
    path: '/api/tasks',
    description: 'Get tasks with filtering and pagination',
    authentication: true,
    parameters: {
      query: {
        status: 'Filter by status',
        priority: 'Filter by priority',
        assignedTo: 'Filter by assigned user',
        clientId: 'Filter by client',
        page: 'Page number (default: 1)',
        limit: 'Items per page (default: 20)',
      },
    },
    responses: {
      200: { description: 'Tasks retrieved successfully' },
    },
  },
];

export const generateDocsEndpoint = (req: Request, res: Response) => {
  const docs = generateApiDocs(apiEndpoints);
  res.json(docs);
};

