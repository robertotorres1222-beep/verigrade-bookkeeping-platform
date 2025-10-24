import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { validateEnv } from './middleware/validateEnv';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import { authenticateToken } from './middleware/auth';
import { prisma } from './config/database';
import { logger } from './utils/logger';

// Load and validate environment variables
dotenv.config();
validateEnv();

// Import routes
import transactionRoutes from './routes/transactionRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import organizationRoutes from './routes/organizationRoutes';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'https://frontend-ovbm64ly8-robertotos-projects.vercel.app',
  'https://frontend-2fjs77xj1-robertotos-projects.vercel.app',
  'https://frontend-mmbx5pbw9-robertotos-projects.vercel.app',
  'https://verigrade-bookkeeping-platform-liw5qwzqa-robertotos-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Apply rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VeriGrade Enhanced Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      aiCategorization: !!process.env.OPENAI_API_KEY,
      pdfGeneration: true,
      queueWorker: !!process.env.REDIS_URL,
      s3Storage: !!(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY)
    }
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'VeriGrade API Documentation',
    version: '2.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/logout': 'Logout user',
        'GET /api/auth/profile': 'Get user profile',
        'POST /api/auth/refresh-token': 'Refresh JWT token'
      },
      transactions: {
        'GET /api/transactions': 'Get transactions with filtering and pagination',
        'POST /api/transactions': 'Create a new transaction',
        'GET /api/transactions/:id': 'Get specific transaction',
        'PUT /api/transactions/:id': 'Update transaction',
        'DELETE /api/transactions/:id': 'Delete transaction',
        'POST /api/transactions/categorize': 'Categorize a transaction using AI',
        'POST /api/transactions/bulk-categorize': 'Bulk categorize transactions',
        'GET /api/transactions/suggestions/:id': 'Get category suggestions',
        'GET /api/transactions/stats': 'Get transaction statistics'
      },
      invoices: {
        'GET /api/invoices': 'Get invoices with filtering and pagination',
        'POST /api/invoices': 'Create a new invoice',
        'GET /api/invoices/:id': 'Get specific invoice',
        'PUT /api/invoices/:id': 'Update invoice',
        'DELETE /api/invoices/:id': 'Delete invoice',
        'GET /api/invoices/:id/pdf': 'Generate and download invoice PDF',
        'POST /api/invoices/:id/pdf/upload': 'Generate PDF and upload to S3',
        'POST /api/invoices/:id/send': 'Mark invoice as sent',
        'POST /api/invoices/:id/mark-paid': 'Mark invoice as paid',
        'GET /api/invoices/stats': 'Get invoice statistics'
      },
      users: {
        'GET /api/users/profile': 'Get user profile',
        'PUT /api/users/profile': 'Update user profile',
        'GET /api/users/settings': 'Get user settings',
        'PUT /api/users/settings': 'Update user settings'
      },
      organizations: {
        'GET /api/organization': 'Get organization details',
        'PUT /api/organization': 'Update organization',
        'GET /api/organization/members': 'Get organization members',
        'POST /api/organization/members': 'Invite member to organization'
      }
    },
    features: {
      aiCategorization: 'Automatically categorize transactions using OpenAI',
      pdfGeneration: 'Generate professional PDF invoices',
      backgroundProcessing: 'Queue-based processing for heavy operations',
      realTimeStats: 'Real-time transaction and invoice statistics',
      secureAuth: 'JWT-based authentication with rate limiting'
    }
  });
});

// Authentication routes (with rate limiting)
app.use('/api/auth', authLimiter, authRoutes);

// Protected API routes (require authentication)
app.use('/api/transactions', authenticateToken, transactionRoutes);
app.use('/api/invoices', authenticateToken, invoiceRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/organization', authenticateToken, organizationRoutes);

// Queue worker status endpoint (for monitoring)
app.get('/api/queue/status', authenticateToken, async (req, res, next) => {
  try {
    if (!process.env.REDIS_URL) {
      return res.json({
        success: true,
        data: {
          status: 'disabled',
          message: 'Queue worker not configured (REDIS_URL not set)'
        }
      });
    }

    // Import queue here to avoid issues if Redis is not available
    const { categorizerQueue } = await import('./queue/categorizerWorker');
    
    const jobCounts = await categorizerQueue.getJobCounts();
    
    res.json({
      success: true,
      data: {
        status: 'active',
        jobCounts,
        queueName: 'categorize-transactions'
      }
    });
  } catch (error) {
    next(error);
  }
});

// System status endpoint
app.get('/api/system/status', authenticateToken, async (req, res, next) => {
  try {
    const status = {
      database: 'connected',
      redis: !!process.env.REDIS_URL ? 'configured' : 'not_configured',
      openai: !!process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
      s3: !!(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY) ? 'configured' : 'not_configured',
      timestamp: new Date().toISOString()
    };

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      status.database = 'connected';
    } catch (error) {
      status.database = 'disconnected';
    }

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
});

// Webhook endpoints (for external integrations)
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    // Stripe webhook verification would go here
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      return res.status(400).json({
        success: false,
        error: { message: 'Stripe webhook secret not configured' }
      });
    }

    // TODO: Implement Stripe webhook verification and processing
    console.log('Stripe webhook received:', req.body);
    
    res.json({ success: true, message: 'Webhook received' });
  } catch (error) {
    next(error);
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    availableEndpoints: '/api'
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
  
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');
    
    app.listen(PORT, () => {
      logger.info(`🚀 VeriGrade Enhanced Backend API running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`📚 API docs: http://localhost:${PORT}/api`);
      logger.info(`🤖 AI Features: ${process.env.OPENAI_API_KEY ? 'Enabled' : 'Disabled'}`);
      logger.info(`📄 PDF Generation: Enabled`);
      logger.info(`⚡ Queue Worker: ${process.env.REDIS_URL ? 'Configured' : 'Not configured'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;












